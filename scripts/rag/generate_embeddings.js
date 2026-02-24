import fs from 'fs';
import 'dotenv/config';

// Logic to generate embeddings using an OpenAI-compatible API
async function generate() {
    const apiKey = process.env.VITE_CUBEBOT_API_KEY; // Reusing Kimi/OpenAI key if possible
    const baseUrl = "https://api.openai.com/v1"; // Default to OpenAI or user-specified

    if (!apiKey) {
        console.error("❌ No API key found in .env (VITE_CUBEBOT_API_KEY)");
        return;
    }

    const rawData = JSON.parse(fs.readFileSync('./src/data/gita_raw.json', 'utf8'));
    console.log(`🤖 Vectorizing ${rawData.length} chunks...`);

    const embeddings = [];

    for (const item of rawData) {
        console.log(`📡 Embedding Chapter ${item.chapter}...`);

        // We would call the API here:
        /*
        const res = await fetch(`${baseUrl}/embeddings`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
          body: JSON.stringify({ model: "text-embedding-3-small", input: item.content })
        });
        const json = await res.json();
        embeddings.push({ ...item, vector: json.data[0].embedding });
        */

        // For the v3 proposal MOVE, I'll mock the vector array to allow integration testing
        // until the user confirms the actual provider to use.
        embeddings.push({
            ...item,
            vector: Array.from({ length: 1536 }, () => Math.random()) // Fake vector for mock
        });
    }

    fs.writeFileSync('./src/data/gita_embeddings.json', JSON.stringify(embeddings));
    console.log("✅ Saved gita_embeddings.json");
}

generate().catch(console.error);
