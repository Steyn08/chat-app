
const io = require("socket.io-client");

// Connect to the server
const socket = io("http://localhost:5000"); // Change URL if your server is running elsewhere

socket.on("connect", () => {
    console.log("✅ Connected to server with ID:", socket.id);

    // Simulate user joining
    socket.emit("join", "67d6eec0aadb75de7a7aaaa6");

    // Send a test message after 2 seconds
    setTimeout(() => {
        console.log("📨 Sending message...");
        socket.emit("sendMessage", {
            sender: "67d6eec0aadb75de7a7aaaa6",
            text: "Hello from user1!",
            receiver: "67e2c7bb00fe4ef6dc5c3998",  // Change this to a real user ID
            groupId: null,
            attachments: [],
        });
    }, 2000);
});

// Listen for incoming messages
socket.on("receiveMessage", (message) => {
    console.log("📩 New Message Received:", message);
});

// Listen for online users update
socket.on("updateOnlineUsers", (users) => {
    console.log("👥 Online Users:", users);
});

// Handle disconnection
socket.on("disconnect", () => {
    console.log("❌ Disconnected from server.");
});
