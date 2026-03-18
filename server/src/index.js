import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const app = express();
app.use(
    cors({
        origin: "*",
    })
);

const server = http.createServer(app);
const io = new Server(server,{
    cors: {
        origin: "*",
    }
});

const users = {};
io.on("connection", (socket) => {
    console.log("A user connected ", socket.id);

    users[socket.id] = socket;

    socket.on("message", (data) => {
        console.log("Message received: ", data);
        const message = {
            senderId: socket.id,
            content: data.content,
        };
        io.emit("message", message);
    });

    socket.on("privateMessage", (data) => {
        console.log("Private message received: ", data);

        const { receiverId, senderId, content } = data;
        const receiverSocket = users[receiverId];

        if (receiverSocket) {
            const result = {
                senderId,
                content,
            };

            receiverSocket.emit("privateMessage", result);
        } else {
            console.log("Receiver not found: ", receiverId);
        }
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected ", socket.id);
        delete users[socket.id];
    });
});

server.listen(process.env.PORT, () => {
    console.log("Server is running on port " + process.env.PORT);
});
