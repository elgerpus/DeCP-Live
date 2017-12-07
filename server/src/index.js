import express from "express";
import http from "http";
import io from "socket.io";
import fs from "fs";
import _ from "lodash";

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
let pageCount = 0;

fs.readdir(__dirname + "/images", (err, dir) => {
    if (err) {
        console.log("Couldn't open images!");
        process.exit(-1);
    }

    _.forEach(dir, (img) => {
        const file = fs.readFileSync(__dirname + "/images/" + img);
        images.push(new Image(img, "data:image/jpg;base64, " + new Buffer(file).toString("base64")));
    });

    pageCount = Math.ceil(images.length / PAGE_SIZE);
});

// _app.get("/", (req, res) => {
//     res.sendFile(__dirname + "/index.html");
// });

_io.on("connection", (socket) => {
    users.push(socket);
    console.log("User: " + socket.id + " connected!");

    socket.on("getImages", (pageNumber) => {
        console.log("User requested page: " + pageNumber);
        const collection = _.chain(images).drop(parseInt(pageNumber - 1) * PAGE_SIZE).take(PAGE_SIZE).value();
        socket.emit("getImages", new Envelope(collection, new Pagination(pageNumber, pageCount)));

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
