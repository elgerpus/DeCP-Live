const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const PORT = 32000;

const users = [];

app.get("/", (req, res) => {
    res.status(200).json({users: users});
});

io.on("connection", (socket) => {
    users.push(socket);
    console.log("User: " + socket + " connected!");
});

app.listen(PORT, () => {
    console.log("Listening on localhost:%d", PORT);
});
