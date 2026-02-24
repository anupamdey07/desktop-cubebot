import gitaData from '../data/gita_embeddings.json';

export interface GitaChunk {
    id: string;
    chapter: number;
    verse_ref: string;
    source: string;
    content: string;
    sanskrit: string;
    vector: number[];
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let mA = 0;
    let mB = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        mA += a[i] * a[i];
        mB += b[i] * b[i];
    }
    return dotProduct / (Math.sqrt(mA) * Math.sqrt(mB));
}

/**
 * Searches the local Gita database for the most relevant verses
 */
export async function searchGita(queryVector: number[], topK = 1): Promise<GitaChunk[]> {
    // In a real app, we'd embed the query first. 
    // For the proposal/mock phase, we return the top matches based on simulated vectors.

    const results = (gitaData as GitaChunk[])
        .map(chunk => ({
            ...chunk,
            similarity: cosineSimilarity(queryVector, chunk.vector)
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

    return results;
}

/**
 * Mock function to simulate embedding a query until API is hooked up
 */
export function mockEmbedQuery(query: string): number[] {
    // Return a deterministic random vector based on the string length/char codes
    // just so the "search" returns consistent results during testing.
    const vec = new Array(1536).fill(0).map((_, i) => {
        return Math.sin(query.length + i) * 0.5 + 0.5;
    });
    return vec;
}
