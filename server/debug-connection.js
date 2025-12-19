const io = require("socket.io-client");

const SOCKET_URL = "http://localhost:3001";
const socket = io(SOCKET_URL);

const TEST_MATCH_ID = "test-match-" + Date.now();
const USER_ID = "user-debug-123";
const AI_USER_ID = "1"; // Assuming '1' is an AI user from seed data, or we pick one active AI
// Based on seedData, usually AI users have specific IDs. Let's use a generic one or check logs.
// Actually, server doesn't validate existence of AI ID for the 'isAI' flag logic, it just needs 'isAI: true' and a 'to' ID.
// But to pick a persona, it uses the ID. Let's use a string that ends in odd/even for persona.
const TARGET_AI_ID = "user_ai_2"; // Female persona likely

console.log("---------------------------------------------------");
console.log("🔍 STARTING PERSISTENCE & READ RECEIPT DEBUGGER");
console.log("---------------------------------------------------");
console.log(`TARGET MATCH ID: ${TEST_MATCH_ID}`);

socket.on("connect", () => {
    console.log("✅ Connected to Server:", socket.id);
    socket.emit("add-user", USER_ID);

    // Send Message
    const userMsgId = "msg-" + Date.now();
    const payload = {
        id: userMsgId,
        matchId: TEST_MATCH_ID,
        senderId: USER_ID,
        receiverId: TARGET_AI_ID, // Sending TO the AI
        to: TARGET_AI_ID,         // Socket event expects 'to'
        content: "Hello AI, do you preserve my matchId?",
        type: "text",
        isAI: true, // FLAG TO TRIGGER AI
        createdAt: new Date().toISOString()
    };

    console.log(`\n📤 Sending Message: "${payload.content}"`);
    console.log(`   -> Message ID: ${payload.id}`);
    console.log(`   -> Match ID: ${payload.matchId}`);

    socket.emit("send-message", payload);
});

socket.on("update-message", (data) => {
    console.log("\n📩 RECEIVED: update-message (Read Receipt)");
    console.log("   -> ID:", data.messageId);
    console.log("   -> Updates:", JSON.stringify(data.updates));

    if (data.updates.isRead === true) {
        console.log("   ✅ SUCCESS: Server marked message as READ.");
    } else {
        console.log("   ❌ FAILURE: Server sent update but NOT isRead:true");
    }
});

socket.on("receive-message", (data) => {
    console.log("\n📩 RECEIVED: receive-message (AI Reply)");
    console.log("   -> ID:", data.id);
    console.log("   -> Content:", data.content);
    console.log("   -> Match ID:", data.matchId);

    if (data.matchId === TEST_MATCH_ID) {
        console.log("   ✅ SUCCESS: Match ID preserved!");
    } else {
        console.log(`   ❌ FAILURE: Match ID mismatch! Expected ${TEST_MATCH_ID}, got ${data.matchId}`);
    }

    console.log("\n---------------------------------------------------");
    console.log("🏁 TEST COMPLETE. Disconnecting...");
    socket.disconnect();
    process.exit(0);
});

// Timeout
setTimeout(() => {
    console.log("\n❌ TIMEOUT: Server did not reply in 10 seconds.");
    socket.disconnect();
    process.exit(1);
}, 10000);
