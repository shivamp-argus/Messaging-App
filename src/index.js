const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage, generateLocation } = require("./utils/message");
const {
  addUser,
  removeUser,
  getUser,
  getUserInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDir = path.join(__dirname, "../public");
const port = process.env.PORT || 3000;

app.use(express.static(publicDir));

// app.get("/", (req, res) => {
//   res.send("Hello");
// });
// let count = 0;
io.on("connection", (socket) => {
  console.log("new websocket connection");

  socket.on("join", ({ message, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, message, room });
    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit("message", generateMessage("Admin", "Welcome"));
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage("Admin", `${user.username} has joined`));
    console.log(getUserInRoom(user.room));
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUserInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Bad words");
    }
    console.log(user);
    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback("Delivered");
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has disconnected`)
      );
      console.log(getUserInRoom(user.room));
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUserInRoom(user.room),
      });
    }
  });
  socket.on("sendLocation", (crds, callback) => {
    const user = getUser(socket.id);
    // console.log(user);
    io.to(user.room).emit(
      "locationMessage",
      generateLocation(
        user.username,
        `https://www.google.com/maps/@${crds.lat},${crds.lon}`
      )
    );
    callback("Location sent");
  });
  //   socket.emit("countUpdated", count);
  //   socket.on("increment", () => {
  //     count++;
  //     // socket.emit("countUpdated", count);
  //     io.emit("countUpdated", count);
  //   });
});

server.listen(port, () => {
  console.log("Listening");
});
