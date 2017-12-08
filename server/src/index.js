import express from "express";
import http from "http";
import io from "socket.io";
import fs from "fs";
import _ from "lodash";
import sharp from "sharp";
// import uuidv4 from "uuid/v4";

const _app = express();
const _http = http.Server(_app);
const _io = io(_http);

const PORT = 32000;
const PAGE_SIZE = 16;
const ROOT_PATH = `${__dirname}/images`;

class Image {
    constructor(imageID, imageString) {
        this.imageID = imageID;
        this.imageString = imageString;
    }
}

class Pagination {
    constructor(currentPage, numberOfPages) {
        this.currentPage = currentPage;
        this.numberOfPages = numberOfPages;
    }
}

class Envelope {
    constructor(images, pagination) {
        this.images = images;
        this.pagination = pagination;
    }
}

const users = [];
const images = [];

const builder = path => {
    try {
        const items = fs.readdirSync(`${ROOT_PATH}${path}`);

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
    const items = fs.readdirSync(ROOT_PATH);

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

    socket.on("getImages", (pageNumber) => {
        // Get the image paths
        const collection = _.chain(images).drop(parseInt(pageNumber - 1) * PAGE_SIZE).take(PAGE_SIZE).value();

        // Resize images and convert to buffer
        const promises = [];
        for (let i = 0; i < collection.length; i++) {
            promises.push(sharp(ROOT_PATH + collection[i]).resize(300).min().toFormat("jpg").toBuffer());
        }

        // After all images have been converted to a buffer
        Promise.all(promises).then(buffers => {
            for (let i = 0; i < collection.length; i++) {
                // Split to send only the relative path
                //const split = collection[i].split(__dirname);

                collection[i] = new Image(collection[i], "data:image/jpg;base64, " + buffers[i].toString("base64"));
            }

            // Send to client
            socket.emit("getImages", new Envelope(collection, new Pagination(pageNumber, Math.ceil(images.length / PAGE_SIZE))));
        });
    });

    socket.on("imageQuery", (imagePaths, b, k) => {
        console.log("User queried. b: " + b + " | k: " + k + " | IDs: " + imagePaths);

        // Make sure variables have values
        if (!b | !k | !imagePaths) {
            socket.emit("imageQuery", false);
            return;
        }

        // File path to pending batch file
        const filepath = __dirname + "/pending_batches/" + b + "." + k;

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
                imagePaths[i] = ROOT_PATH + imagePaths[i];
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

                socket.emit("imageQuery", true);
            });
        });
    });

    socket.on("disconnect", () => {
        users.splice(users.indexOf(socket), 1);
        console.log("User: " + socket.id + " disconnected!");
    });
});

_http.listen(PORT, () => {
    console.log("Listening on localhost:%d", PORT);
});
