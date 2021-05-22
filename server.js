const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Datastore = require("nedb");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const database = new Datastore("database.db");
database.loadDatabase();

//database.insert({name:"Georgiana"});
//database.insert({name:"Andreea"});
//database.insert({name:"Diana"});
//database.insert({name:"Paul"});

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "Buzzer Bot ";

// Run when client connects
io.on("connection", (socket) => {
  socket.on("add-user", (usr) => {
    database.insert({name:usr});
  })

  socket.on("delete-user", (usr) => {
    database.remove({name:usr});
  })

  socket.on("update-user", ({oldUser, newUser}) => {
    database.update({name:oldUser},{name:newUser});
  })

  socket.on("joinRoom", ({ username, room }) => {
    database.findOne({ name: username }, function (err, doc) {
      if (doc != null) {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        // Welcome current user
        socket.emit("message", formatMessage(botName, "Welcome to Buzzer!")); // trimite mesajul la client

        // Broadcast when a user connects
        socket.broadcast // Mesajul este emis tuturor celorlalti participanti
          .to(user.room)
          .emit(
            "message",
            formatMessage(botName, `${user.username} has joined the chat`)
          );

        // Send users and room info
        io.to(user.room).emit("roomUsers", {
          room: user.room,
          users: getRoomUsers(user.room),
        });
      } else {
        const user = userJoin(socket.id, username, "Empty room");

        socket.join(user.room);

        // Welcome current user
        socket.emit("message", formatMessage(botName, "Welcome to the empty room!")); // trimite mesajul la client

        // Broadcast when a user connects
        socket.broadcast // Mesajul este emis tuturor celorlalti participanti
          .to(user.room)
          .emit(
            "message",
            formatMessage(botName, `${user.username} has joined the chat`)
          );

        // Send users and room info
        io.to(user.room).emit("roomUsers", {
          room: user.room,
          users: getRoomUsers(user.room),
        });
      }
    });
  });

  // Listen for chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id); // retine user-ul care a trimis mesajul

    socket.broadcast.to(user.room).emit("message", formatMessage(user.username, msg)); // emite mesajul primit tuturor clientilor
    socket.emit("messageSend",formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
