import fs from 'fs';
// Using native fetch available in Node 18+

const ENGLISH_URL = "https://www.gutenberg.org/files/2388/2388-h/2388-h.htm";
const SANSKRIT_URL = "http://gretil.sub.uni-goettingen.de/gretil/1_sanskr/2_epic/mbh/ext/bhagvg_u.htm";

async function fetchAndParse() {
    console.log("🚀 Starting Gita Acquisition...");

    // 1. Get English (Arnold Translation)
    console.log("📥 Fetching English text...");
    const enRes = await fetch(ENGLISH_URL);
    const enHtml = await enRes.text();

    // Basic cleaning (this is a simplified regex-based parser for the Gutenberg HTML)
    // We look for "CHAPTER X" and then verses. Arnold's translation is in verse/poetry.
    const verses = [];

    // Split by Chapter
    const chapters = enHtml.split(/CHAPTER\s+[IVXLCD]+/i);
    chapters.shift(); // Remove preface

    console.log(`✅ Parsed ${chapters.length} chapters.`);

    // 2. Mocking the structured data for now to test the pipeline
    // In a full implementation, we'd use a DOM parser or complex regex to align verses.
    // For RAG demo purposes, we will chunk by Chapter for now or smaller paragraphs.

    const gitaData = chapters.map((content, index) => ({
        id: `gita_en_ch${index + 1}`,
        chapter: index + 1,
        source: "Project Gutenberg",
        content: content.replace(/<[^>]*>/g, '').trim().slice(0, 2000) // Strip HTML and limit for now
    }));

    fs.writeFileSync('./src/data/gita_raw.json', JSON.stringify(gitaData, null, 2));
    console.log("💾 Saved gita_raw.json to src/data/");
}

fetchAndParse().catch(console.error);
