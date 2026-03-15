import { ChatSession } from '../types'

/**
 * Service to sync a chat session to the Karakeep REST API
 */
export async function syncSessionToKarakeep(session: ChatSession, jetsonIp: string = '192.168.0.152') {
    // 1. Format the session as a beautiful Markdown document
    const markdown = `# Chat: ${session.title}\n\n` + 
        `**Model:** ${session.model || 'Unknown'}\n` +
        `**Date:** ${new Date(session.updatedAt).toLocaleString()}\n` +
        `**Tags:** ${session.tags.map(t => `#${t}`).join(' ') || 'none'}\n\n` +
        `---\n\n` +
        session.messages.map(m => {
            const role = m.role === 'user' ? '👤 **User**' : '🤖 **CubeBot**'
            return `${role}:\n${m.content}\n\n`
        }).join('---\n\n')

    // 2. Prepare the payload for Karakeep
    // Assuming Karakeep has a "create note" or "ingest" endpoint
    // Adjust port/path as needed (common port for Karakeep is 8080)
    const url = `http://${jetsonIp}:8080/api/v1/notes` 

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: session.title,
                content: markdown,
                tags: [...session.tags, 'cubebot-sync'],
                source: 'CubeBot Desktop'
            })
        })

        if (!response.ok) throw new Error(`Karakeep sync failed: ${response.statusText}`)
        
        return { success: true }
    } catch (err: any) {
        console.error('Karakeep Sync Error:', err)
        throw err
    }
}
