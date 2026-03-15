import { ChatSession } from '../types'
import { useChatStore } from '../store/useChatStore'

/**
 * Sync a chat session to Karakeep as a text note.
 *
 * API schema (from karakeep-app/karakeep source, packages/shared/types/bookmarks.ts):
 *   POST /api/v1/bookmarks
 *   {
 *     type: "text",          // discriminated union field — top-level, not nested
 *     text: string,          // the actual content — also top-level
 *     title?: string,        // optional top-level title
 *     note?: string,         // optional meta-note separate from text
 *   }
 *
 * Tags are added after creation via POST /api/v1/bookmarks/:id/tags
 * with { tagName: "..." } (NOT { name: "..." })
 */
export async function syncSessionToKarakeep(session: ChatSession) {
    const { settings } = useChatStore.getState()
    const baseUrl = (settings.karakeepUrl || '').replace(/\/$/, '')
    const apiKey  = settings.karakeepApiKey || ''

    if (!baseUrl) {
        throw new Error('Karakeep URL not configured. Set it in Settings → Knowledge Base.')
    }
    if (!apiKey) {
        throw new Error('Karakeep API key not configured. Set it in Settings → Knowledge Base.')
    }

    // Format the session as readable markdown text
    const body =
        session.messages
            .filter(m => m.role !== 'system')
            .map(m => {
                const role = m.role === 'user' ? 'User' : 'CubeBot'
                return `${role}:\n${m.content}`
            }).join('\n\n---\n\n')

    // Correct flat payload — type+text are top-level, NOT nested in content:{}
    const payload = {
        type: 'text',
        text: body || '(empty session)',
        title: session.title,
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
    }

    console.log(`[Karakeep] Syncing "${session.title}" to ${baseUrl}`)

    const response = await fetch(`${baseUrl}/api/v1/bookmarks`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText)
        throw new Error(`Karakeep sync failed (${response.status}): ${errorText}`)
    }

    const result = await response.json()
    console.log('[Karakeep] Created bookmark id:', result.id)

    // Add tags separately if the session has any
    const tagNames = [...(session.tags || []), 'cubebot-sync']
    if (result.id && tagNames.length > 0) {
        await fetch(`${baseUrl}/api/v1/bookmarks/${result.id}/tags`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                tags: tagNames.map(t => ({ tagName: t }))  // tagName, NOT name
            }),
        }).catch(e => console.warn('[Karakeep] Tag attachment failed:', e))
    }

    return { success: true, id: result.id }
}
