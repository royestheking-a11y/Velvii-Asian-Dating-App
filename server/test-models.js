
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Use one of the provided keys
const API_KEY = "AIzaSyBtHZy_gZK8IK6wJEnJZq4akdxbkurugKI";

async function listModels() {
    const genAI = new GoogleGenerativeAI(API_KEY);
    console.log("Fetching available models...");

    try {
        // There isn't a direct listModels on genAI instance in some versions, 
        // but usually specific model get works. 
        // Actually, standard check is to try a known model or just error log.
        // But let's try to just run a simple prompt on "gemini-1.0-pro" which is often the fallback.

        const modelsToTry = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro", "gemini-1.5-pro"];

        for (const modelName of modelsToTry) {
            console.log(`\nTesting model: ${modelName}`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                console.log(`✅ ${modelName} WORKED! Response: ${result.response.text()}`);
                process.exit(0); // Found a working one!
            } catch (e) {
                console.log(`❌ ${modelName} Failed: ${e.message.split('\n')[0]}`);
            }
        }

    } catch (error) {
        console.error("Fatal Error:", error);
    }
}

listModels();
