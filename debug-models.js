const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

async function listModels() {
    const envPath = path.join(__dirname, '.env.local');
    let apiKey = '';
    try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GEMINI_API_KEY=(.*)/);
        if (match) {
            apiKey = match[1].trim();
        }
    } catch (e) {
        console.error("Failed to read .env.local", e);
        return;
    }

    if (!apiKey) {
        console.error("No GEMINI_API_KEY found in .env.local");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    console.log("Using API Key ending in...", apiKey.slice(-4));
    try {
        // There isn't a direct listModels method on the client instance in some versions, 
        // but let's try to just use a known model to see if we can get a better error or success on a simple prompt.
        // actually, we can't easily list models with this SDK version without using the model manager if available.
        // Let's try to run a simple generateContent with a very standard model to debug.

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Test");
        console.log("gemini-pro success");
    } catch (e) {
        console.log("gemini-pro failed:", e.message);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Test");
        console.log("gemini-1.5-flash success");
    } catch (e) {
        console.log("gemini-1.5-flash failed:", e.message);
    }
}

listModels();
