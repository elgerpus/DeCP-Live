import express from "express";
import http from "http";
import io from "socket.io";
import fs from "fs";
import _ from "lodash";
import sharp from "sharp";

const _app = express();
const _http = http.Server(_app);
const _io = io(_http);

const PORT = 32000;
const PAGE_SIZE = 16;

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

fs.readdir(__dirname + "/images/1holidays", (err, dir) => {
    if (err) {
        console.log("Couldn't open images!");
        process.exit(-1);
    }

    console.log("Adding image paths...");

    for (let i = 0; i < dir.length; i++) {
        images.push(__dirname + "/images/1holidays/" + dir[i]);
    }

    console.log("Image paths added");
});

_io.on("connection", (socket) => {
    users.push(socket);
    console.log("User: " + socket.id + " connected!");

    socket.on("getImages", (pageNumber) => {
        // Get the image paths
        const collection = _.chain(images).drop(parseInt(pageNumber - 1) * PAGE_SIZE).take(PAGE_SIZE).value();

        // Resize images and convert to buffer
        const promises = [];
        for (let i = 0; i < collection.length; i++) {
            promises.push(sharp(collection[i]).resize(300).min().toFormat("jpg").toBuffer());
        }

        // After all images have been converted to a buffer
        Promise.all(promises).then(buffers => {
            for (let i = 0; i < collection.length; i++) {
                // Split on / to get the file name
                const split = collection[i].split("/");

                collection[i] = new Image(split[split.length - 1], "data:image/jpg;base64, " + buffers[i].toString("base64"));
            }

            // Send to client
            socket.emit("getImages", new Envelope(collection, new Pagination(pageNumber, Math.ceil(images.length / PAGE_SIZE))));
        });
    });

    socket.on("imageQuery", (imageIDs) => {
        console.log("User queried IDs: " + imageIDs);
        socket.emit("imageQuery", true);

    });

    socket.on("disconnect", () => {
        users.splice(users.indexOf(socket), 1);
        console.log("User: " + socket.id + " disconnected!");
    });
});

_http.listen(PORT, () => {
    console.log("Listening on localhost:%d", PORT);
});
