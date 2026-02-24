import fs from 'fs';

const ENGLISH_URL = "https://www.gutenberg.org/files/2388/2388-h/2388-h.htm";
// Simplified Sanskrit mapping (Key verses for the demo)
const SANSKRIT_SAMPLES = {
    "1.1": "धृतराष्ट्र उवाच | धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः | मामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय ||",
    "2.47": "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन | मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ||",
    "3.19": "तस्मादसक्तः सततं कार्यं कर्म समाचर | असक्तो ह्याचरन्कर्म परमाप्नोति पूरुषः ||"
};

async function fetchAndAlign() {
    console.log("📥 Fetching English text from Project Gutenberg...");
    const enRes = await fetch(ENGLISH_URL);
    const enHtml = await enRes.text();

    // Strip headers/footers
    const mainContent = enHtml.split('CHAPTER I')[1].split('*** END OF THE PROJECT GUTENBERG EBOOK')[0];

    // Split into Chapters
    const chapters = mainContent.split(/CHAPTER\s+[IVXLCD]+/i);

    const alignedChunks = [];

    chapters.forEach((content, i) => {
        const chapterNum = i + 1;
        // Clean text
        const cleanContent = content.replace(/<[^>]*>/g, '').trim();

        // We chunk each chapter into manageable 800-character segments
        // In a high-res RAG we'd do per-verse, but for Arnold's poetry, 
        // paragraph/segment chunking is more contextually accurate.
        const segments = cleanContent.split('\n\n').filter(s => s.length > 50);

        segments.forEach((seg, j) => {
            const id = `${chapterNum}.${j + 1}`;
            alignedChunks.push({
                id: `gita_${id}`,
                verse_ref: id,
                source: "Arnold Translation (Gutenberg)",
                content: seg.trim(),
                sanskrit: SANSKRIT_SAMPLES[id] || "Sanskrit verse reference pending full alignment..."
            });
        });
    });

    fs.writeFileSync('./src/data/gita_aligned.json', JSON.stringify(alignedChunks, null, 2));
    console.log(`✅ Aligned ${alignedChunks.length} chunks. Saved to src/data/gita_aligned.json`);
}

fetchAndAlign().catch(console.error);
