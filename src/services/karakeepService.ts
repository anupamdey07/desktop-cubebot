import { ChatSession } from '../types'

const KARAKEEP_URL = 'https://cubebot-ubuntu.tailc63e0c.ts.net:3000'
const KARAKEEP_API_KEY = '' // Set this from settings if needed

/**
 * Sync a chat session to Karakeep as a bookmark/note
 * Karakeep API: POST /api/v1/bookmarks
 */
export async function syncSessionToKarakeep(session: ChatSession, apiKey?: string) {
    const key = apiKey || KARAKEEP_API_KEY

    // Format the session as a Markdown document
    const markdown = `# Chat: ${session.title}\n\n` +
        `**Model:** ${session.model || 'Unknown'}\n` +
        `**Date:** ${new Date(session.updatedAt).toLocaleString()}\n` +
        `**Tags:** ${session.tags.map(t => `#${t}`).join(' ') || 'none'}\n\n` +
        `---\n\n` +
        session.messages
            .filter(m => m.role !== 'system')
            .map(m => {
                const role = m.role === 'user' ? '👤 **User**' : '🤖 **CubeBot**'
                return `${role}:\n${m.content}\n\n`
            }).join('---\n\n')

    // Karakeep expects a bookmark with type=note and content
    const payload = {
        type: 'text',
        title: session.title,
        text: markdown,
        tags: [...session.tags, 'cubebot-sync'].map(t => ({ name: t })),
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    }
    if (key) headers['Authorization'] = `Bearer ${key}`

    console.log(`[Karakeep] Syncing "${session.title}" to ${KARAKEEP_URL}`)

    const response = await fetch(`${KARAKEEP_URL}/api/v1/bookmarks`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    })

    if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText)
        throw new Error(`Karakeep sync failed (${response.status}): ${errorText}`)
    }

    const result = await response.json()
    console.log('[Karakeep] Sync successful:', result)
    return { success: true, id: result.id }
}
