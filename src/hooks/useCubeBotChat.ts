import { useRef, useCallback } from 'react'
import { useChatStore } from '../store/useChatStore'
import { streamChatCompletion } from '../services/cubeBotApi'
import { speakWithMood, stopSpeaking, parseMoodTag } from '../services/voiceService'

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

            // Add user message
            const userMsg = addMessage({ role: 'user', content: userText })

            // Add empty assistant placeholder
            addMessage({ role: 'assistant', content: '' })

            setStreaming(true)
            setBotStatus('thinking')

            abortControllerRef.current = new AbortController()
            let fullContent = ''
            let firstToken = true

            await streamChatCompletion(
                [...messages, userMsg],
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
