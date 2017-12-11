import express from "express";
import http from "http";
import io from "socket.io";
import fs from "fs-extra";
import _ from "lodash";
import sharp from "sharp";
// import uuidv4 from "uuid/v4";

const _app = express();
const _http = http.Server(_app);
const _io = io(_http);

const PORT = 32000;
const PAGE_SIZE = 16;
const IMAGE_PATH = `${__dirname}/images`;
const PENDING_BATCHES_PATH = `${__dirname}/pending_batches`;
const READY_BATCHES_PATH = `${__dirname}/ready_batches`;
const RESULTS_PATH = `${__dirname}/results`;
const STATUS = {
    QUEUED: 0,
    RUNNING: 1,
    DONE: 2
};

class Image {
    constructor(imageID, imageString) {
        this.imageID = imageID;
        this.imageString = imageString;
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
    constructor(batchID, status, b, k, timestamp, images) {
        this.batchID = batchID;
        this.status = status;
        this.b = b;
        this.k = k;
        this.timestamp = timestamp;
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
fs.ensureDirSync(IMAGE_PATH);
fs.ensureDirSync(PENDING_BATCHES_PATH);
fs.ensureDirSync(READY_BATCHES_PATH);
fs.ensureDirSync(RESULTS_PATH);

const builder = path => {
    try {
        const items = fs.readdirSync(`${IMAGE_PATH}${path}`);

        for (let i = 0; i < items.length; i++) {
            builder(`${path}/${items[i]}`);
        }
    }
    catch (err) {
        if (!path.includes(".DS_Store")) {
            console.log("Added: " + path);
            images.push(path);
        }
    }
};

try {
    const items = fs.readdirSync(IMAGE_PATH);

    for (let i = 0; i < items.length; i++) {
        builder(`/${items[i]}`);
    }
}
catch (err) {
    console.log(err);
}

// fs.readdir(__dirname + "/images/1holidays", (err, dir) => {
//     if (err) {
//         console.log("Couldn't open images!");
//         process.exit(-1);
//     }

//     console.log("Adding image paths...");

//     for (let i = 0; i < dir.length; i++) {
//         images.push(__dirname + "/images/1holidays/" + dir[i]);
//     }

//     console.log("Image paths added");
// });

_io.on("connection", (socket) => {
    users.push(socket);
    console.log("User: " + socket.id + " connected!");

    // Get query images
    socket.on("getQueryImages", (pageNumber) => {
        // Get the image paths
        const collection = _.chain(images).drop(parseInt(pageNumber - 1) * PAGE_SIZE).take(PAGE_SIZE).value();

        // Resize images and convert to buffer
        const promises = [];
        for (let i = 0; i < collection.length; i++) {
            promises.push(sharp(IMAGE_PATH + collection[i]).resize(300).min().toFormat("jpg").toBuffer());
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
    socket.on("imageQuery", (imagePaths, b, k) => {
        console.log("User queried. b: " + b + " | k: " + k + " | IDs: " + imagePaths);

        // Make sure variables have values
        if (!b | !k | !imagePaths) {
            socket.emit("imageQuery", false);
            return;
        }

        // File path to pending batch file
        const filepath = PENDING_BATCHES_PATH + "/" + b + "." + k;

        // Create file if not exists
        if (!fs.existsSync(filepath)) {
            fs.openSync(filepath, "w");
        }

        // Read the pending batch file
        fs.readFile(filepath, (err, data) => {
            if (err) {
                console.log("Couldn't open/create pending batch file: " + filepath);
                socket.emit("imageQuery", false);
                return;
            }

            let contents = data.toString();
            let n;
            let paths;

            // Prepend root path to imageIDs
            for (let i = 0; i < imagePaths.length; i++) {
                imagePaths[i] = IMAGE_PATH + imagePaths[i];
            }

            // File has contents -> Don't add duplicates and update header
            if (contents.length !== 0) {
                // Get lines of file and throw away empty lines
                const arr = contents.split("\n").filter(x => x);

                // Remove the header
                arr.shift();

                // Combine the query and file contents, no duplicates
                const pathsArr = _.union(arr, imagePaths);

                n = pathsArr.length;
                paths = pathsArr.join("\n");
            }
            // File is empty -> Add all paths and create header
            else {
                n = imagePaths.length;
                paths = imagePaths.join("\n");
            }

            // Construct file contents
            contents = b + ":" + k + ":" + n + ":\n" + paths + "\n";

            // Write contents to the file (overwrite)
            fs.writeFile(filepath, contents, err => {
                if (err) {
                    console.log(err);
                    socket.emit("imageQuery", false);
                    return;
                }

                // Emit to the client
                socket.emit("imageQuery", true);
            });
        });
    });

    // Get results
    socket.on("getBatchResults", (pageNumber) => {
        // Read results directory
        fs.readdir(RESULTS_PATH)
            .then(results => {
                // Only list directories, not files
                const dirs = results.filter(f => fs.statSync(`${RESULTS_PATH}/${f}`).isDirectory());

                // Take a subset for pagination
                const collection = _.chain(dirs).drop(parseInt(pageNumber - 1) * PAGE_SIZE).take(PAGE_SIZE).value();

                // Read the batch.res files
                const promises = [];
                for (let i = 0; i < collection.length; i++) {
                    promises.push(fs.readFile(`${RESULTS_PATH}/${collection[i]}/batch.res`));
                }

                Promise.all(promises)
                    .then(resultFiles => {
                        // Parse the files
                        const items = [];
                        for (let i = 0; i < resultFiles.length; i++) {
                            const lines = resultFiles[i].toString().split("\n").filter(x => x);
                            const header = lines[0].split(":");
                            items.push(new Result(header[0], STATUS.DONE, header[1], header[2], new Date(), lines.length - 1));
                        }

                        // Emit to the client
                        socket.emit("getBatchResults", new Envelope(items, new Pagination(pageNumber, Math.ceil(results.length / PAGE_SIZE))));
                    })
                    .catch(err => {
                        console.log(err);
                    });
            })
            .catch(err => {
                console.log(err);
            });
    });

    // Get header info of result
    socket.on("getBatchInfo", batchID => {
        console.log("Batch info for " + batchID);

        fs.readFile(`${RESULTS_PATH}/${batchID}/batch.res`)
            .then(contents => {
                // Get lines and strip away empty lines
                const lines = contents.toString().split("\n").filter(x => x);

                // Get rid of header
                const header = lines.shift().split(":");

                new Result(header[0], STATUS.DONE, header[1], header[2], new Date(), lines.length);

                socket.emit("getBatchInfo", new Result(header[0], STATUS.DONE, header[1], header[2], new Date(), lines.length));
            })
            .catch(() => {
                socket.emit("getBatchInfo", false);
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
                for (let i = 0; i < collection.length; i++) {
                    console.log(collection[i]);
                    promises.push(sharp(collection[i]).resize(300).min().toFormat("jpg").toBuffer());
                }

                // After all images have been converted to a buffer
                Promise.all(promises)
                    .then(buffers => {
                        for (let i = 0; i < collection.length; i++) {
                            const id = collection[i].split(IMAGE_PATH)[1].substring(1).replace(/\//g, "#");
                            collection[i] = new Image(id, "data:image/jpg;base64, " + buffers[i].toString("base64"));
                        }

                        // Send to client
                        socket.emit("getBatchImages", new Envelope(collection, new Pagination(pageNumber, Math.ceil(lines.length / PAGE_SIZE))));
                    })
                    .catch(err => {
                        console.log(err);
                        socket.emit("getBatchImages", false);
                    });
            })
            .catch((err) => {
                console.log(err);
                socket.emit("getBatchImages", false);
            });
    });

    // Get result image
    socket.on("getBatchImage", (image) => {
        console.log("getBatchImage");
        console.log(image);
        const path = `${IMAGE_PATH}/${image.replace(/#/g, "/")}`;
        console.log(path);

        sharp(path).resize(300).min().toFormat("jpg").toBuffer()
            .then(buffer => {
                const img = new Image(image, "data:image/jpg;base64, " + buffer.toString("base64"));

                socket.emit("getBatchImage", img);
            })
            .catch(() => {
                socket.emit("getBatchImage", false);
            });
    });

    socket.on("getResultImages", (batchID, imageID, pageNumber) => {
        console.log(`getResultImages: ${RESULTS_PATH}/${batchID}/${imageID}.res`);
        fs.readFile(`${RESULTS_PATH}/${batchID}/${imageID}.res`)
            .then(contents => {
                // Get lines and strip away empty lines
                const lines = contents.toString().split("\n").filter(x => x);
                lines.shift();

                const collection = _.chain(lines).drop(parseInt(pageNumber - 1) * PAGE_SIZE).take(PAGE_SIZE).value();

                const promises = [];
                const fields = [];
                for (let i = 0; i < collection.length; i++) {
                    fields.push(collection[i].split(":"));
                    promises.push(sharp(fields[i][0]).resize(300).min().toFormat("jpg").toBuffer());
                }

                Promise.all(promises)
                    .then(buffers => {
                        for (let i = 0; i < collection.length; i++) {
                            const id = fields[i][0].split(IMAGE_PATH)[1].substring(1).replace(/\//g, "#");
                            collection[i] = new ImageResult(id, "data:image/jpg;base64, " + buffers[i].toString("base64"), fields[i][1]);
                        }

                        socket.emit("getResultImages", new Envelope(collection, new Pagination(pageNumber, Math.ceil(lines.length / PAGE_SIZE))));
                    })
                    .catch(err => {
                        console.log(err);
                        socket.emit("getResultImages", false);
                    });
            })
            .catch((err) => {
                console.log(err);
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
