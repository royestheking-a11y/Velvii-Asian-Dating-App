
const io = require("socket.io-client");
const socket = io("http://localhost:3001");

socket.on("connect", () => {
    console.log("Connected to server");

    // Simulate sending a message to an AI
    const aiUserId = "test_ai_user_999"; // Ends in odd number -> Male
    socket.emit("send-message", {
        to: aiUserId,
        content: "Hello AI, are you working?",
        senderId: "test_user",
        isAI: true
    });
});

socket.on("receive-message", (data) => {
    console.log("Received reply:", data);
    process.exit(0);
});

setTimeout(() => {
    console.log("Timeout waiting for reply");
    process.exit(1);
}, 10000);
