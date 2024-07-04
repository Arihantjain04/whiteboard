import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { addUser, getUser, getUsersInRoom, removeUser } from "./users.js";

dotenv.config();

const app = express();

const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server is listening on port 3000");
});

let roomIdGlobal, imgURLGlobal;

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("userJoined", (data) => {
    const { name, roomId, userId, host, presenter } = data;
    roomIdGlobal = roomId;
    socket.join(roomId);
    const users = addUser({
      name,
      roomId,
      userId,
      host,
      presenter,
      socketId: socket.id,
    });
    const usersR = getUsersInRoom(roomId);
    socket.emit("userIsJoined", { success: true, usersR });
    socket.broadcast.to(roomId).emit("userJoinedMessage", name);
    socket.broadcast.to(roomId).emit("allUsers", usersR);
    socket.broadcast.to(roomId).emit("whiteBoardDataResponse", {
      imgURL: imgURLGlobal,
    });
  });

  socket.on("whiteBoardData", (data) => {
    imgURLGlobal = data;
    socket.broadcast.to(roomIdGlobal).emit("whiteBoardDataResponse", {
      imgURL: data,
    });
  });

  socket.on("message", (data) => {
    const { message } = data;
    const user = getUser(socket.id);
    if (user) {
      socket.broadcast
        .to(roomIdGlobal)
        .emit("messageResponse", { message, name: user.name });
    }
  });

  socket.on("disconnect", () => {
    const user = getUser(socket.id);
    if (user) {
      removeUser(socket.id);
      const usersR = getUsersInRoom(user.roomId);
      socket.broadcast.to(user.roomId).emit("allUsers", usersR);
      socket.broadcast.to(user.roomId).emit("userLeftMessage", user.name);
    }
  });
});
