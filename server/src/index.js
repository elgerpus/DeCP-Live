import express from "express";
import http from "http";
import io from "socket.io";
import fs from "fs-extra";
import _ from "lodash";
import sharp from "sharp";
import hash from "hash.js";
import chokidar from "chokidar";

// Setup
const _app = express();
const _http = http.Server(_app);
const _io = io(_http);

// Constants
const ADMIN_HASH = "a952c520bb584addd838f1fb7705fb05c79bebc337c3dedd490f3e218a18857803154aff41a64b0eddaa18640c450eb5";
const HASH_ITERATIONS = 15713;
const PASSWORD_LENGTH_LIMIT = 64;
const SAVE_FILENAME = "save.batch";
const HALT_FILENAME = "halt.batch";
const PAGE_SIZE = 16;
const STATUS = {
    QUEUED: 0,
    RUNNING: 1,
    DONE: 2
};
const RUNNING_BATCH = [];
const QUEUED_BATCHES = [];

// Arguments
if (process.argv.length !== 6) {
    console.log("Please supply only the port, images path, queries path and results path!");
    process.exit(-1);
}

const PORT = process.argv[2];
const IMAGES_PATH = process.argv[3];
const QUERIES_PATH = process.argv[4];
const RESULTS_PATH = process.argv[5];

// Classes
class Image {
    constructor(imageID, imageString) {
        this.imageID = imageID;
        this.imageString = imageString;
    }
}

class BatchImage {
    constructor(imageID, imageString, features) {
        this.imageID = imageID;
        this.imageString = imageString;
        this.features = features;
    }
}

class ImageResult {
    constructor(imageID, imageString, votes) {
        this.imageID = imageID;
        this.imageString = imageString;
        this.votes = votes;
    }
}

class Result {
    constructor(batchID, status, b, k, totalTime, timePerImage, images) {
        this.batchID = batchID;
        this.status = status;
        this.b = b;
        this.k = k;
        this.totalTime = totalTime;
        this.timePerImage = timePerImage;
        this.images = images;
    }
}

class Pagination {
    constructor(currentPage, numberOfPages) {
        this.currentPage = currentPage;
        this.numberOfPages = numberOfPages;
    }
}

class Envelope {
    constructor(items, pagination) {
        this.items = items;
        this.pagination = pagination;
    }
}

const users = [];
const images = [];

// Create directory structures if it doesn't exist
fs.ensureDirSync(IMAGES_PATH);
fs.ensureDirSync(QUERIES_PATH);
fs.ensureDirSync(RESULTS_PATH);

// Build query image paths
const builder = path => {
    try {
        const items = fs.readdirSync(`${IMAGES_PATH}${path}`);

        for (let i = 0; i < items.length; i++) {
            builder(`${path}/${items[i]}`);
        }
    }
    catch (err) {
        if (path.includes(".jpg")) {
            images.push(path);
        }
    }
};

try {
    const items = fs.readdirSync(IMAGES_PATH);

    for (let i = 0; i < items.length; i++) {
        builder(`/${items[i]}`);
    }
}
catch (err) {
    console.log(new Date() + ": " + err);
}

// Watchers
const query_watcher = chokidar.watch(QUERIES_PATH);
query_watcher.on("unlink", () => {
    // Add to running
    RUNNING_BATCH.push(QUEUED_BATCHES.shift());
});

const result_watcher = chokidar.watch(RESULTS_PATH, {
    ignoreInitial: true
});
result_watcher.on("addDir", () => {
    // Remove from running
    RUNNING_BATCH.shift();
    _io.emit("newResult", true);
});

// Sockets
_io.on("connection", (socket) => {
    users.push(socket);
    console.log("User: " + socket.id + " connected!");

    // Hash password 
    const hashPassword = password => {
        // Potentially trim the password
        password = password.substring(0, PASSWORD_LENGTH_LIMIT);

        let sum = HASH_ITERATIONS;
        for (let i = 0; i < password.length; i++) {
            sum += password.charCodeAt(i);
        }

        let hashed = password;

        for (let i = 0; i < sum; i++) {
            hashed = hash.sha384().update(hashed).digest("hex");
        }

        return hashed;
    };

    // Admin authenticate
    socket.on("adminAuthenticate", password => {
        const hashed = hashPassword(password);
        socket.emit("adminAuthenticate", hashed === ADMIN_HASH);
    });

    // Admin save
    socket.on("adminSave", password => {
        const hashed = hashPassword(password);

        if (hashed === ADMIN_HASH) {
            fs.openSync(`${QUERIES_PATH}/${SAVE_FILENAME}`, "w");
            socket.emit("adminSave", true);
        }
        else {
            fs.openSync(`${QUERIES_PATH}/${HALT_FILENAME}`, "w");
            socket.emit("adminSave", false);
        }
    });

    // Admin halt
    socket.on("adminHalt", password => {
        const hashed = hashPassword(password);

        if (hashed === ADMIN_HASH) {
            fs.openSync(`${QUERIES_PATH}/${HALT_FILENAME}`, "w");
            socket.emit("adminHalt", true);
        }
        else {
            socket.emit("adminHalt", false);
        }
    });

    // Get query images
    socket.on("getQueryImages", (pageNumber) => {
        // Get the image paths
        const collection = _.chain(images).drop(parseInt(pageNumber - 1) * PAGE_SIZE).take(PAGE_SIZE).value();

        // Resize images and convert to buffer
        const promises = [];
        for (let i = 0; i < collection.length; i++) {
            promises.push(sharp(IMAGES_PATH + collection[i]).resize(300).min().toFormat("jpg").toBuffer());
        }

        // After all images have been converted to a buffer
        Promise.all(promises).then(buffers => {
            for (let i = 0; i < collection.length; i++) {
                collection[i] = new Image(collection[i], "data:image/jpg;base64, " + buffers[i].toString("base64"));
            }

            // Send to client
            socket.emit("getQueryImages", new Envelope(collection, new Pagination(pageNumber, Math.ceil(images.length / PAGE_SIZE))));
        });
    });

    // Submit image query
    socket.on("imageQuery", (imagePaths, b, k, top) => {
        console.log("User queried. b: " + b + " | k: " + k + " | IDs: " + imagePaths);

        // Make sure variables have values
        if (!b | !k | !top | !imagePaths) {
            socket.emit("imageQuery", false);
            return;
        }

        // File path to pending batch file
        const id = Date.now();
        const filepath = QUERIES_PATH + "/" + id + ".batch";

        // Prepend root path to imageIDs
        for (let i = 0; i < imagePaths.length; i++) {
            imagePaths[i] = IMAGES_PATH + imagePaths[i];
        }

        // Construct file contents
        const contents = b + ":" + k + ":" + top + ":" + imagePaths.length + ":\n" + imagePaths.join("\n") + "\n";

        // Write contents to the file (overwrite)
        fs.writeFile(filepath, contents, err => {
            if (err) {
                console.log(new Date() + ": " + err);
                socket.emit("imageQuery", false);
                return;
            }

            // Add query to queued batches
            QUEUED_BATCHES.push(new Result(id, STATUS.RUNNING, b, k, 0, 0, imagePaths.length));

            // Emit to the client
            socket.emit("imageQuery", true);
        });
    });

    // Get results
    socket.on("getBatchResults", (pageNumber) => {
        // Batches
        let items = [];

        // Add the running batch, if any
        if (RUNNING_BATCH.length) {
            items.push(RUNNING_BATCH[RUNNING_BATCH.length - 1]);
        }

        // Read queued directory
        fs.readdir(QUERIES_PATH)
            .then(pending_batches => {
                // Only list files, not directories
                const files = pending_batches.filter(f => fs.statSync(`${QUERIES_PATH}/${f}`).isFile() && f.includes(".batch") && !f.includes(SAVE_FILENAME) && !f.includes(HALT_FILENAME));

                // Take a subset for pagination
                const collection = _.chain(files).drop(parseInt(pageNumber - 1) * PAGE_SIZE).take(PAGE_SIZE).value();

                // Read the batch.res files
                const promises = [];
                for (let i = 0; i < collection.length; i++) {
                    promises.push(fs.readFile(`${QUERIES_PATH}/${collection[i]}`));
                }

                Promise.all(promises)
                    .then(resultFiles => {
                        // Parse the files
                        for (let i = 0; i < resultFiles.length; i++) {
                            const lines = resultFiles[i].toString().split("\n").filter(x => x);
                            const id = collection[i].slice(0, -6);
                            const header = lines[0].split(":");
                            items.push(new Result(id, STATUS.QUEUED, header[0], header[1], 0, 0, lines.length - 1));
                        }

                        items = _.sortBy(items, ["id"]);

                        if (items.length !== PAGE_SIZE) {
                            // Read results directory
                            fs.readdir(RESULTS_PATH)
                                .then(results => {
                                    // Only list directories, not files
                                    const dirs = results.filter(f => fs.statSync(`${RESULTS_PATH}/${f}`).isDirectory());

                                    // Take a subset for pagination
                                    const collection = _.chain(dirs).reverse().drop(parseInt(pageNumber - 1) * PAGE_SIZE).take(PAGE_SIZE).value();

                                    // Read the batch.res files
                                    const promises = [];
                                    for (let i = 0; i < collection.length; i++) {
                                        promises.push(fs.readFile(`${RESULTS_PATH}/${collection[i]}/batch.res`));
                                    }

                                    Promise.all(promises)
                                        .then(resultFiles => {
                                            // Parse the files
                                            let doneItems = [];
                                            for (let i = 0; i < resultFiles.length; i++) {
                                                const lines = resultFiles[i].toString().split("\n").filter(x => x);
                                                const id = collection[i];
                                                const header = lines.shift().split(":");
                                                doneItems.push(new Result(id, STATUS.DONE, header[0], header[1], header[4], header[4] / lines.length, lines.length));
                                            }

                                            doneItems = _.sortBy(doneItems, ["id"]);

                                            items.push.apply(items, doneItems);
                                            items = items.splice(0, 16);

                                            const numberOfPages = Math.ceil((pending_batches.length + results.length) / PAGE_SIZE);

                                            // Emit to the client
                                            socket.emit("getBatchResults", new Envelope(items, new Pagination(pageNumber, numberOfPages)));
                                        })
                                        .catch(err => {
                                            console.log(new Date() + ": " + err);
                                        });
                                })
                                .catch(err => {
                                    console.log(new Date() + ": " + err);
                                });
                        }
                    })
                    .catch(err => {
                        console.log(new Date() + ": " + err);
                    });
            })
            .catch(err => {
                console.log(new Date() + ": " + err);
            });
    });

    // Get header info of result
    socket.on("getBatchInfo", batchID => {
        console.log("Batch info for " + batchID);

        fs.readFile(`${QUERIES_PATH}/${batchID}.batch`)
            .then(contents => {
                // Get lines and strip away empty lines
                const lines = contents.toString().split("\n").filter(x => x);

                // Get rid of header
                const header = lines.shift().split(":");

                socket.emit("getBatchInfo", new Result(batchID, STATUS.QUEUED, header[1], header[2], undefined, undefined, lines.length));
            })
            .catch(() => {
                fs.readFile(`${RESULTS_PATH}/${batchID}/batch.res`)
                    .then(contents => {
                        // Get lines and strip away empty lines
                        const lines = contents.toString().split("\n").filter(x => x);

                        // Get rid of header
                        const header = lines.shift().split(":");

                        socket.emit("getBatchInfo", new Result(batchID, STATUS.DONE, header[0], header[1], header[4], header[4] / lines.length, lines.length));
                    })
                    .catch(() => {
                        socket.emit("getBatchInfo", false);
                    });
            });
    });

    // Get images of a result
    socket.on("getBatchImages", (batchID, pageNumber) => {
        fs.readFile(`${RESULTS_PATH}/${batchID}/batch.res`)
            .then(contents => {
                // Get lines and strip away empty lines
                const lines = contents.toString().split("\n").filter(x => x);
                lines.shift();

                // Take a subset for pagination
                const collection = _.chain(lines).drop(parseInt(pageNumber - 1) * PAGE_SIZE).take(PAGE_SIZE).value();

                // Resize images and convert to buffer
                const promises = [];
                const paths = [];
                for (let i = 0; i < collection.length; i++) {
                    paths[i] = collection[i].split(batchID)[1].substring(1).replace(/#/g, "/").slice(0, -4);
                    promises.push(sharp(paths[i]).resize(300).min().toFormat("jpg").toBuffer());
                }

                // After all images have been converted to a buffer
                Promise.all(promises)
                    .then(buffers => {
                        for (let i = 0; i < collection.length; i++) {
                            const id = paths[i].split(IMAGES_PATH)[1].substring(1).replace(/\//g, "#");
                            collection[i] = new Image(id, "data:image/jpg;base64, " + buffers[i].toString("base64"));
                        }

                        // Send to client
                        socket.emit("getBatchImages", new Envelope(collection, new Pagination(pageNumber, Math.ceil(lines.length / PAGE_SIZE))));
                    })
                    .catch(err => {
                        console.log(new Date() + ": " + err);
                        socket.emit("getBatchImages", false);
                    });
            })
            .catch((err) => {
                console.log(new Date() + ": " + err);
                socket.emit("getBatchImages", false);
            });
    });

    // Get top result images for a batch image
    socket.on("getBatchImagesTopResults", (batchID, pageNumber, top) => {
        fs.readFile(`${RESULTS_PATH}/${batchID}/batch.res`)
            .then(contents => {
                // Get lines and strip away empty lines
                const lines = contents.toString().split("\n").filter(x => x);
                lines.shift();

                // Take a subset for pagination
                const collection = _.chain(lines).drop(parseInt(pageNumber - 1) * PAGE_SIZE).take(PAGE_SIZE).value();

                // For each batch query image on the page, read their result file
                const promises = [];
                for (let i = 0; i < collection.length; i++) {
                    // const path = `${RESULTS_PATH}/${batchID}/${collection[i].replace(/\//g, "#")}.res`;
                    promises.push(fs.readFile(collection[i]));
                }

                // After all result files have been read
                Promise.all(promises)
                    .then(contents => {
                        // For each result file, get the top image results
                        let images = [];
                        for (let i = 0; i < contents.length; i++) {
                            // Get lines and strip away empty lines
                            const lines = contents[i].toString().split("\n").filter(x => x);
                            lines.shift();
                            images[i] = _.chain(lines).take(top).value();
                        }

                        // Resize the image results
                        const resizePromises = [];
                        for (let i = 0; i < images.length; i++) {
                            for (let j = 0; j < images[i].length; j++) {
                                resizePromises.push(sharp(images[i][j].split(":")[0]).resize(300).min().toFormat("jpg").toBuffer());
                            }
                        }

                        Promise.all(resizePromises)
                            .then(buffers => {
                                // Resize images
                                images = [];
                                for (let i = 0; i < buffers.length; i += top) {
                                    const arr = [];
                                    for (let j = 0; j < top; j++) {
                                        arr.push(new Image("", "data:image/jpg;base64, " + buffers[i + j].toString("base64")));
                                    }

                                    images.push(arr);
                                }

                                // Emit to client
                                socket.emit("getBatchImagesTopResults", images);
                            })
                            .catch(err => {
                                console.log(new Date() + ": " + err);
                                socket.emit("getBatchImagesTopResults", false);
                            });
                    })
                    .catch((err) => {
                        console.log(new Date() + ": " + err);
                        socket.emit("getBatchImagesTopResults", false);
                    });
            })
            .catch((err) => {
                console.log(new Date() + ": " + err);
                socket.emit("getBatchImagesTopResults", false);
            });
    });

    // Get batch image
    socket.on("getBatchImage", (batchID, imageID) => {
        fs.readFile(`${RESULTS_PATH}/${batchID}/${IMAGES_PATH.replace(/\//g, "#")}#${imageID}.res`)
            .then(contents => {
                // Get lines and strip away empty lines
                const lines = contents.toString().split("\n");
                const header = lines.shift().split(":");

                sharp(header[0]).resize(300).min().toFormat("jpg").toBuffer()
                    .then(buffer => {
                        console.log(header);
                        const image = new BatchImage(imageID, "data:image/jpg;base64, " + buffer.toString("base64"), header[1]);

                        socket.emit("getBatchImage", image);
                    })
                    .catch(() => {
                        socket.emit("getBatchImage", false);
                    });
            })
            .catch(err => {
                console.log(new Date() + ": " + err);
                socket.emit("getBatchImage", false);
            });
    });

    // Get result images
    socket.on("getResultImages", (batchID, imageID, pageNumber) => {
        fs.readFile(`${RESULTS_PATH}/${batchID}/${IMAGES_PATH.replace(/\//g, "#")}#${imageID}.res`)
            .then(contents => {
                // Get lines and strip away empty lines
                const lines = contents.toString().split("\n").filter(x => x);
                lines.shift();

                // Get a subset of the result images
                const collection = _.chain(lines).drop(parseInt(pageNumber - 1) * PAGE_SIZE).take(PAGE_SIZE).value();

                // Resize the images
                const promises = [];
                const fields = [];
                for (let i = 0; i < collection.length; i++) {
                    fields.push(collection[i].split(":"));
                    promises.push(sharp(fields[i][0]).resize(300).min().toFormat("jpg").toBuffer());
                }

                Promise.all(promises)
                    .then(buffers => {
                        // Construct the image result return array
                        for (let i = 0; i < collection.length; i++) {
                            const pathSplit = fields[i][0].split("/");
                            const id = pathSplit[pathSplit.length - 1].split(".")[0];
                            collection[i] = new ImageResult(id, "data:image/jpg;base64, " + buffers[i].toString("base64"), fields[i][1]);
                        }

                        // Emit to client
                        socket.emit("getResultImages", new Envelope(collection, new Pagination(pageNumber, Math.ceil(lines.length / PAGE_SIZE))));
                    })
                    .catch(err => {
                        console.log(new Date() + ": " + err);
                        socket.emit("getResultImages", false);
                    });
            })
            .catch((err) => {
                console.log(new Date() + ": " + err);
                socket.emit("getResultImages", false);
            });
    });

    // Disconnect
    socket.on("disconnect", () => {
        users.splice(users.indexOf(socket), 1);
        console.log("User: " + socket.id + " disconnected!");
    });
});

_http.listen(PORT, () => {
    console.log("Listening on localhost:%d", PORT);
});

process.on("SIGINT", () => {
    query_watcher.close();
    result_watcher.close();
    console.log("EXITING");
    process.exit();
});
