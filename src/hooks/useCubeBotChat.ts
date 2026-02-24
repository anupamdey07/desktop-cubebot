import { useRef, useCallback } from 'react'
import { useChatStore } from '../store/useChatStore'
import { streamChatCompletion } from '../services/cubeBotApi'
import { searchGita, mockEmbedQuery } from '../services/ragService'
import { speakWithMood, stopSpeaking, parseMoodTag } from '../services/voiceService'
import type { Message } from '../types'

export function useCubeBotChat() {
    const {
        messages,
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
            if (isStreaming) return

            // Stop any current speaking before starting a new turn
            stopSpeaking()

            // 1. RAG Search — Find relevant Gita verse
            // (Real implementation would use a real embedding API here)
            const queryVector = mockEmbedQuery(userText)
            const gitaHits = await searchGita(queryVector, 1)
            const contextMsg = gitaHits.length > 0
                ? `[GITA CONTEXT]: Reference Verse ${gitaHits[0].verse_ref}: "${gitaHits[0].content}" | Sanskrit: ${gitaHits[0].sanskrit}`
                : ""

            // Add user message
            const userMsg = addMessage({ role: 'user', content: userText })

            // Add empty assistant placeholder
            addMessage({ role: 'assistant', content: '' })

            setStreaming(true)
            setBotStatus('thinking')

            abortControllerRef.current = new AbortController()
            let fullContent = ''
            let firstToken = true

            // Inject GITA context into the conversation (invisible to user via filter in api call)
            const messagesWithContext: Message[] = [
                ...messages,
                {
                    id: `rag_${Date.now()}`,
                    role: 'system',
                    content: contextMsg,
                    timestamp: new Date()
                },
                userMsg
            ]

            await streamChatCompletion(
                messagesWithContext,
                settings,
                {
                    onMessage: (token: string) => {
                        if (firstToken) {
                            setBotStatus('speaking')
                            firstToken = false
                        }
                        fullContent += token
                        // Strip mood tag from displayed text (e.g. "[HYPE] Great!" → "Great!")
                        const { cleanText } = parseMoodTag(fullContent)
                        updateLastMessage(cleanText)
                    },
                    onComplete: () => {
                        setStreaming(false)
                        abortControllerRef.current = null

                        // Final clean of mood tag from display
                        const { cleanText } = parseMoodTag(fullContent)
                        updateLastMessage(cleanText)

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
                        updateLastMessage(`⚠️ ${err.message}`)
                        setStreaming(false)
                        setBotStatus('error')
                        abortControllerRef.current = null
                        // Reset to idle after a delay
                        setTimeout(() => setBotStatus('idle'), 3000)
                    },
                }
            )
        },
        [messages, isStreaming, settings, addMessage, updateLastMessage, setStreaming, setBotStatus]
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
