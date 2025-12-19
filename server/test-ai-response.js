
const io = require("socket.io-client");

// Connect to the backend
const socket = io("http://localhost:3001");

const TEST_AI_ID = "emma.ai@velvii.app"; // An AI user ID
const MY_ID = "test_verifier_999";

console.log("------------------------------------------------");
console.log("🧪 STARTING AI SYSTEM VERIFICATION");
console.log("------------------------------------------------");

socket.on("connect", () => {
    console.log("✅ Connected to Socket Server");

    // Simulate sending a message
    const msg = {
        to: TEST_AI_ID,
        from: MY_ID,
        content: "Hello! Who are you?",
        senderId: MY_ID,
        isAI: true // Critical flag
    };

    console.log(`📤 Sending message: "${msg.content}"`);
    socket.emit("send-message", msg);
});

let replyCount = 0;

socket.on("receive-message", (data) => {
    replyCount++;
    console.log(`\n📨 Received Reply #${replyCount}:`);
    console.log(`   From: ${data.senderId}`);
    console.log(`   Content: "${data.content}"`);

    if (data.content.includes("busy")) {
        console.log("⚠️ WARNING: Received FALLBACK message (AI failed).");
    } else {
        console.log("✅ SUCCESS: Received valid AI response.");
    }
});

// Wait 10 seconds to ensure no double replies
setTimeout(() => {
    console.log("\n------------------------------------------------");
    console.log("🏁 TEST COMPLETE");
    console.log(`Total Replies Received: ${replyCount}`);

    if (replyCount === 1) {
        console.log("✅ RESULT: PASSED (Single, valid response received)");
    } else if (replyCount === 0) {
        console.log("❌ RESULT: FAILED (No response received)");
    } else {
        console.log("⚠️ RESULT: WARNING (Multiple responses received - check for duplicates)");
    }
    console.log("------------------------------------------------");
    process.exit(0);
}, 10000);
