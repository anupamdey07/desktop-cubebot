import type { Message, CubeBotSettings } from '../types'

const API_BASE_URL = 'https://api.moonshot.cn/v1'

export interface StreamCallbacks {
    onMessage: (content: string) => void
    onError: (error: Error) => void
    onComplete: () => void
}

export async function streamChatCompletion(
    messages: Message[],
    settings: CubeBotSettings,
    callbacks: StreamCallbacks
) {
    const { gatewayUrl, gatewayKey, model } = settings

    if (!gatewayUrl || !gatewayKey) {
        callbacks.onError(new Error('Gateway URL and Master Key are required. Please check Settings.'))
        return
    }

    try {
        const baseUrl = gatewayUrl.replace(/\/$/, '')
        const endpoint = `${baseUrl}/v1/chat/completions`

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${gatewayKey}`,
            },
            body: JSON.stringify({
                model: settings.model,
                messages: [
                    { role: 'system', content: settings.systemPrompt },
                    ...messages
                        .filter((m) => m.content.trim().length > 0) // drop empty placeholders
                        .map((m) => ({ role: m.role, content: m.content })),
                ],
                temperature: settings.temperature,
                max_tokens: settings.maxTokens,
                stream: true,
            }),
        })

        if (!response.ok) {
            const errText = await response.text()
            let friendlyMsg = `API error ${response.status}`
            try {
                const errJson = JSON.parse(errText)
                const msg: string = errJson?.error?.message ?? errText
                const type: string = errJson?.error?.type ?? ''
                if (type === 'exceeded_current_quota_error' || msg.includes('insufficient balance')) {
                    friendlyMsg = '💳 Your account has run out of credits. Please top up at the provider dashboard.'
                } else if (type === 'invalid_authentication_error' || response.status === 401) {
                    friendlyMsg = '🔑 Invalid API key. Please check your key in Settings.'
                } else if (response.status === 429) {
                    friendlyMsg = '⏳ Rate limited — please wait a moment and try again.'
                } else {
                    friendlyMsg = msg
                }
            } catch {
                friendlyMsg = errText
            }
            throw new Error(friendlyMsg)
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() ?? ''

            for (const line of lines) {
                const trimmed = line.trim()
                if (!trimmed || trimmed === 'data: [DONE]') continue
                if (!trimmed.startsWith('data: ')) continue

                try {
                    const json = JSON.parse(trimmed.slice(6))
                    const delta = json.choices?.[0]?.delta?.content
                    if (delta) callbacks.onMessage(delta)
                } catch {
                    // skip malformed chunks
                }
            }
        }

        callbacks.onComplete()
    } catch (err) {
        callbacks.onError(err instanceof Error ? err : new Error(String(err)))
    }
}
