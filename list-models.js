const apiKey = "AIzaSyBweZcuwPWM9dvoQIVHGljJP-WfODkoHlU"; // Hardcoded for this diagnostic script

async function list() {
    try {
        console.log("Fetching models...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`));
        } else {
            console.log("Error or no models:", JSON.stringify(data, null, 2));
        }
    } catch (e) { console.error(e); }
}
list();
