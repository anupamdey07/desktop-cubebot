import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatStore, Message, CubeBotSettings } from '../types'

const DEFAULT_SETTINGS: CubeBotSettings = {
    apiKey: import.meta.env.VITE_CUBEBOT_API_KEY ?? '',
    model: 'moonshot-v1-8k',
    systemPrompt:
        'You are CubeBot, a brilliant and friendly AI assistant. You are helpful, concise, and a little playful. Always be helpful and keep answers clear and focused.',
    temperature: 0.7,
    maxTokens: 2048,
}

const generateId = () => Math.random().toString(36).slice(2, 11)

export const useChatStore = create<ChatStore>()(
    persist(
        (set, get) => ({
            messages: [],
            isStreaming: false,
            botState: { status: 'idle', eyeTarget: { x: 0, y: 0 } },
            settings: DEFAULT_SETTINGS,

            addMessage: (msg) => {
                const newMsg: Message = {
                    ...msg,
                    id: generateId(),
                    timestamp: new Date(),
                }
                set((state) => ({ messages: [...state.messages, newMsg] }))
                return newMsg
            },

            updateLastMessage: (content) => {
                set((state) => {
                    const msgs = [...state.messages]
                    if (msgs.length === 0) return state
                    msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content }
                    return { messages: msgs }
                })
            },

            setStreaming: (v) => set({ isStreaming: v }),

            setBotStatus: (status) =>
                set((state) => ({ botState: { ...state.botState, status } })),

            setEyeTarget: (pos) =>
                set((state) => ({ botState: { ...state.botState, eyeTarget: pos } })),

            updateSettings: (s) =>
                set((state) => ({ settings: { ...state.settings, ...s } })),

            clearHistory: () => set({ messages: [] }),
        }),
        {
            name: 'cubebot-chat-storage',
            partialize: (state) => ({
                messages: state.messages,
                settings: state.settings,
            }),
            // If localStorage has a blank key, patch it from env
            onRehydrateStorage: () => (state) => {
                if (state && !state.settings.apiKey) {
                    const envKey = import.meta.env.VITE_CUBEBOT_API_KEY ?? ''
                    if (envKey) state.settings = { ...state.settings, apiKey: envKey }
                }
            },
        }
    )
)
