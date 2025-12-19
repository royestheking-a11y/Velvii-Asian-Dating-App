const io = require("socket.io-client");

const SOCKET_URL = "http://localhost:3001";
const socket = io(SOCKET_URL);

const TEST_MATCH_ID = "test-match-" + Date.now();
const USER_ID = "user-debug-client";
const TARGET_ID = "user_ai_test";

console.log("\n---------------------------------------------------");
console.log("🔍 CLI VERIFICATION FOR AI CHAT");
console.log("---------------------------------------------------");
console.log(`TARGET MATCH ID: ${TEST_MATCH_ID}`);

let isReadReceived = false;
let isReplyReceived = false;

socket.on("connect", () => {
    console.log("✅ Connected:", socket.id);
    socket.emit("add-user", USER_ID);

    const payload = {
        id: "msg-" + Date.now(),
        matchId: TEST_MATCH_ID,
        senderId: USER_ID,
        to: TARGET_ID,
        content: "Hello AI, are you working?",
        type: "text",
        isAI: true,
        createdAt: new Date().toISOString()
    };

    console.log(`\n📤 Sending: "${payload.content}"`);
    socket.emit("send-message", payload);
});

socket.on("update-message", (data) => {
    console.log(`\n📩 [READ RECEIPT] ID: ${data.messageId}, Updates: ${JSON.stringify(data.updates)}`);
    if (data.updates.isRead === true) {
        console.log("   ✅ PASS: Read receipt received.");
        isReadReceived = true;
    }
    checkDone();
});

socket.on("receive-message", (data) => {
    console.log(`\n📩 [AI REPLY] Content: "${data.content}"`);
    console.log(`   -> Match ID: ${data.matchId}`);

    if (data.matchId === TEST_MATCH_ID) {
        console.log("   ✅ PASS: Match ID preserved (Persistence OK).");
        isReplyReceived = true;
    } else {
        console.log(`   ❌ FAIL: Expected ${TEST_MATCH_ID}, got ${data.matchId}`);
    }
    checkDone();
});

function checkDone() {
    if (isReadReceived && isReplyReceived) {
        console.log("\n✅✅ ALL CHECKS PASSED. AI Integration is FULLY FUNCTIONAL.");
        socket.disconnect();
        process.exit(0);
    }
}

setTimeout(() => {
    console.log("\n❌ TIMEOUT: Did not receive all events.");
    socket.disconnect();
    process.exit(1);
}, 10000);
