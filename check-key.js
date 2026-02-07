
const fs = require('fs');
const path = require('path');

async function checkKey() {
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
        console.error("No API Key found");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        // using dynamic import or assuming fetch is global (Node 18+)
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", JSON.stringify(data.error, null, 2));
        } else {
            console.log("Success! Available models:");
            if (data.models) {
                data.models.forEach(m => console.log(`- ${m.name}`));
            } else {
                console.log("No models returned (empty list).");
            }
        }
    } catch (e) {
        console.error("Network Error:", e);
    }
}

checkKey();
