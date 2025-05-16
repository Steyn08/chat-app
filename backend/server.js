const express = require("express");
const http = require("http");
const bcrypt = require("bcrypt");
const PORT = process.env.PORT || 5000;
const User = require("./models/User");
const cors = require("cors");
const dotenv = require("dotenv").config();
const { Server } = require("socket.io");
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const connectDB = require("./db");
const authRoutes = require("./routes/auth.js");
const userRoutes = require("./routes/user.js");
const friendsRoutes = require("./routes/friends.js");
const groupRoutes = require("./routes/groups.js");
const authMiddleware = require("./middlewares/auth.js");
const multer = require("multer");
const Message = require("./models/Message.js");
const messageRoutes = require("./routes/messages");
const cookieParser = require("cookie-parser");
import fs from 'fs';
import path from 'path';

const app = express();
const server = http.createServer(app);
const upload = multer();

const messagesDir = path.join(__dirname, 'public/messages');

if (!fs.existsSync(messagesDir)) {
  fs.mkdirSync(messagesDir, { recursive: true });
}

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use("/public", express.static("public"));
app.use(express.urlencoded({ extended: true }));

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);
const users = {};
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Save user's socket ID
  socket.on("register", (userId) => {
    users[userId] = socket.id;
    socket.userId = userId;
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on("check-user-online", (userIdToCheck) => {
    console.log('check-user-online',userIdToCheck);
    
    const isOnline = Boolean(users[userIdToCheck]);
    socket.emit("user-online-status", { userId: userIdToCheck, isOnline });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);
    delete users[socket.userId];
  });
});

app.use("/auth", authRoutes);
app.use("/messages", authMiddleware, messageRoutes);
app.use("/user", authMiddleware, userRoutes);
app.use("/friends", authMiddleware, friendsRoutes);
app.use("/groups", authMiddleware, groupRoutes);

app.get("/", (req, res) => {
  res.send("<p>hiii</p>");
});

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
