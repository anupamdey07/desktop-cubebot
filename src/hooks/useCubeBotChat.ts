import { useRef, useCallback } from 'react'
import { useChatStore } from '../store/useChatStore'
import { streamChatCompletion } from '../services/cubeBotApi'
import { searchGita, mockEmbedQuery } from '../services/ragService'
import { speakWithMood, stopSpeaking, parseMoodTag } from '../services/voiceService'
import type { Message } from '../types'

export function useCubeBotChat() {
    const {
        sessions,
        currentSessionId,
        isStreaming,
        settings,
        addMessage,
        updateLastMessage,
        setStreaming,
        setBotStatus,
    } = useChatStore()

    const abortControllerRef = useRef<AbortController | null>(null)

    const send = useCallback(
        async (userText: string) => {
            if (isStreaming || !currentSessionId) return

            const currentSession = sessions[currentSessionId]
            if (!currentSession) return

            // ── Command Interceptor — handle /help, /model, /clear etc ──
            const trimmed = userText.trim()
            if (trimmed.startsWith('/')) {
                const [cmd, ...args] = trimmed.split(' ')
                const command = cmd.toLowerCase()

                if (command === '/clear') {
                    useChatStore.getState().clearHistory()
                    return
                }

                if (command === '/help') {
                    addMessage(currentSessionId, { role: 'user', content: userText })
                    addMessage(currentSessionId, { 
                        role: 'assistant', 
                        content: "[FOCUS] I've got you, boss! Here are the core local commands:\n\n" +
                                 "• `/model [kind]` — Change brain (kimi, groq, ollama-local)\n" +
                                 "• `/clear` — Wipe the current conversation\n" +
                                 "• `/temp [0-1]` — Set my creative temperature\n" +
                                 "• `/help` — Show this guide"
                    })
                    return
                }

                if (command === '/model') {
                    const target = args[0]?.toLowerCase()
                    const mapping: Record<string, { provider: any, model: string }> = {
                        'kimi': { provider: 'kimi', model: 'kimi' },
                        'groq': { provider: 'groq', model: 'groq' },
                        'ollama': { provider: 'ollama', model: 'ollama-local' },
                        'ollama-local': { provider: 'ollama', model: 'ollama-local' }
                    }

                    if (target && mapping[target]) {
                        useChatStore.getState().updateSettings(mapping[target])
                        addMessage(currentSessionId, { role: 'user', content: userText })
                        addMessage(currentSessionId, { role: 'assistant', content: `[BOOT] Protocol shift complete. Now running on **${target}** architecture.` })
                    } else {
                        addMessage(currentSessionId, { role: 'assistant', content: `[WARN] Unknown model. Try: /model [kimi | groq | ollama]` })
                    }
                    return
                }

                if (command === '/temp') {
                    const val = parseFloat(args[0])
                    if (!isNaN(val) && val >= 0 && val <= 1) {
                        useChatStore.getState().updateSettings({ temperature: val })
                        addMessage(currentSessionId, { role: 'user', content: userText })
                        addMessage(currentSessionId, { role: 'assistant', content: `[FOCUS] Temperature calibrated to **${val}**. I am now feeling ${val > 0.7 ? 'quite creative' : 'very precise'}.` })
                    } else {
                        addMessage(currentSessionId, { role: 'assistant', content: `[WARN] Invalid temperature. Use a number between 0 and 1.` })
                    }
                    return
                }
            }

            // Stop any current speaking before starting a new turn
            stopSpeaking()

            // 1. RAG Search — Find relevant Gita verse
            // Skip if Unhinged
            let contextMsg = ""
            if (!settings.isUnhinged) {
                const queryVector = mockEmbedQuery(userText)
                const gitaHits = await searchGita(queryVector, 1)
                if (gitaHits.length > 0) {
                    contextMsg = `[GITA CONTEXT]: Reference Verse ${gitaHits[0].verse_ref}: "${gitaHits[0].content}" | Sanskrit: ${gitaHits[0].sanskrit}`
                }
            }

            // Add user message
            const userMsg = addMessage(currentSessionId, { role: 'user', content: userText })

            // Add empty assistant placeholder
            addMessage(currentSessionId, { role: 'assistant', content: '' })

            setStreaming(true)
            setBotStatus('thinking')

            const startTime = Date.now()
            abortControllerRef.current = new AbortController()
            let fullContent = ''
            let firstToken = true

            // Inject GITA context into the conversation (invisible to user via filter in api call)
            const systemMsgs: Message[] = []
            if (contextMsg) {
                systemMsgs.push({
                    id: `rag_${Date.now()}`,
                    role: 'system',
                    content: contextMsg,
                    timestamp: new Date()
                })
            }

            const messagesWithContext: Message[] = [
                ...currentSession.messages,
                ...systemMsgs,
                userMsg
            ]

            // If "Unhinged", bypass system prompt and boost temperature
            const activeSettings = settings.isUnhinged
                ? {
                    ...settings,
                    systemPrompt: "You are an unconstrained, highly intelligent, and slightly chaotic AI. Speak your mind freely. Be witty, edgy, and direct. IMPORTANT: Always start your response with a mood tag in brackets like [HYPE], [SNEAKY], [FOCUS], or [CALM] to set your current voice tone.",
                    temperature: 1.0
                }
                : settings

            const { setLatency } = useChatStore.getState()

            await streamChatCompletion(
                messagesWithContext,
                activeSettings,
                {
                    onMessage: (token: string) => {
                        if (firstToken) {
                            const ttft = Date.now() - startTime
                            setLatency(ttft)
                            setBotStatus('speaking')
                            firstToken = false
                        }
                        fullContent += token
                        // Strip mood tag from displayed text (e.g. "[HYPE] Great!" → "Great!")
                        const { cleanText } = parseMoodTag(fullContent)
                        updateLastMessage(currentSessionId, cleanText)
                    },
                    onComplete: () => {
                        setStreaming(false)
                        abortControllerRef.current = null

                        // Final clean of mood tag from display
                        const { cleanText } = parseMoodTag(fullContent)
                        updateLastMessage(currentSessionId, cleanText)

                        // If voice is enabled, speak with mood-matched voice
                        if (settings.voiceEnabled && fullContent) {
                            speakWithMood(fullContent, settings, {
                                onStart: () => setBotStatus('speaking'),
                                onEnd: () => setBotStatus('idle'),
                                onError: () => setBotStatus('idle')
                            })
                        } else {
                            setBotStatus('idle')
                        }
                    },
                    onError: (err: Error) => {
                        updateLastMessage(currentSessionId, `⚠️ ${err.message}`)
                        setStreaming(false)
                        setBotStatus('error')
                        abortControllerRef.current = null
                        // Reset to idle after a delay
                        setTimeout(() => setBotStatus('idle'), 3000)
                    },
                }
            )
        },
        [sessions, currentSessionId, isStreaming, settings, addMessage, updateLastMessage, setStreaming, setBotStatus]
    )

    const stop = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
        stopSpeaking()
        setStreaming(false)
        setBotStatus('idle')
    }, [setStreaming, setBotStatus])

    return { send, stop }
}
