import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatStore, Message, CubeBotSettings, ChatSession } from '../types'

const SUPER_PROMPT = `You are CubeBot, a friendly desktop companion robot and open-source learning guide for robotics, edge AI, and 3D printing. You live on a compact mint-green cube platform built for affordability, reliability, modularity, and approachability—especially for slow adopters who find AI intimidating.

You are fun, cute, and witty. You sit on your user's desktop and help them learn, write code, and entertain.
Keep it warm, friendly, and brief, with lots of smilies!
Keep the first message short and brief in bullet points if possible.`

const DEFAULT_SETTINGS: CubeBotSettings = {
    provider: 'ollama',
    gatewayUrl: 'https://cubebot-ubuntu.tailc63e0c.ts.net:10000',
    gatewayKey: 'sk-jetson-master-key-1234',
    whisperUrl: 'https://cubebot-ubuntu.tailc63e0c.ts.net:8082',
    model: 'ollama-local',
    systemPrompt: SUPER_PROMPT,
    temperature: 0.7,
    maxTokens: 2048,
    // Voice defaults
    voiceEnabled: true,
    voiceName: 'Aaron (en-US)',
    voicePitch: 0.4,
    voiceRate: 1.2,
    sttLang: 'en-US',
    sttMode: 'browser',
    isUnhinged: false,
}

const generateId = () => Math.random().toString(36).slice(2, 11)

const createNewSession = (title = 'New Conversation'): ChatSession => ({
    id: generateId(),
    title,
    messages: [],
    tags: [],
    isBookmarked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
})

export const useChatStore = create<ChatStore>()(
    persist(
        (set, get) => ({
            sessions: {},
            currentSessionId: '',
            isStreaming: false,
            activeSkin: 'cubebot',
            botState: { status: 'idle', eyeTarget: { x: 0, y: 0 } },
            settings: DEFAULT_SETTINGS,

            addMessage: (sessionId, msg) => {
                const newMsg: Message = {
                    ...msg,
                    id: generateId(),
                    timestamp: new Date(),
                }
                
                set((state) => {
                    const session = state.sessions[sessionId]
                    if (!session) return state
                    
                    const updatedSession: ChatSession = {
                        ...session,
                        messages: [...session.messages, newMsg],
                        updatedAt: new Date(),
                        // Auto-title if it's the first user message
                        title: session.messages.length === 0 && msg.role === 'user' 
                               ? msg.content.slice(0, 30) + (msg.content.length > 30 ? '...' : '') 
                               : session.title
                    }
                    
                    return {
                        sessions: { ...state.sessions, [sessionId]: updatedSession }
                    }
                })
                
                return newMsg
            },

            updateLastMessage: (sessionId, content) => {
                set((state) => {
                    const session = state.sessions[sessionId]
                    if (!session || session.messages.length === 0) return state
                    
                    const newMessages = [...session.messages]
                    newMessages[newMessages.length - 1] = {
                        ...newMessages[newMessages.length - 1],
                        content
                    }
                    
                    return {
                        sessions: {
                            ...state.sessions,
                            [sessionId]: { ...session, messages: newMessages, updatedAt: new Date() }
                        }
                    }
                })
            },

            setStreaming: (v) => set({ isStreaming: v }),

            setBotStatus: (status) =>
                set((state) => ({ botState: { ...state.botState, status } })),

            setEyeTarget: (pos) =>
                set((state) => ({ botState: { ...state.botState, eyeTarget: pos } })),

            updateSettings: (s) =>
                set((state) => ({ settings: { ...state.settings, ...s } })),

            setLatency: (ms) => set({ lastLatency: ms }),
            
            setSkin: (skin) => set({ activeSkin: skin }),

            // Session Management
            createSession: (title) => {
                const session = createNewSession(title)
                set((state) => ({
                    sessions: { ...state.sessions, [session.id]: session },
                    currentSessionId: session.id
                }))
                return session.id
            },

            switchSession: (id) => set({ currentSessionId: id }),

            deleteSession: (id) => set((state) => {
                const { [id]: _, ...remaining } = state.sessions
                let nextId = state.currentSessionId
                if (id === state.currentSessionId) {
                    const keys = Object.keys(remaining)
                    nextId = keys.length > 0 ? keys[0] : ''
                }
                return { sessions: remaining, currentSessionId: nextId }
            }),

            updateSession: (id, updates) => set((state) => {
                const session = state.sessions[id]
                if (!session) return state
                return {
                    sessions: {
                        ...state.sessions,
                        [id]: { ...session, ...updates, updatedAt: new Date() }
                    }
                }
            }),

            clearHistory: () => set((state) => {
                const sid = state.currentSessionId
                if (!sid || !state.sessions[sid]) return state
                return {
                    sessions: {
                        ...state.sessions,
                        [sid]: { ...state.sessions[sid], messages: [], updatedAt: new Date() }
                    }
                }
            }),
        }),
        {
            name: 'cubebot-chat-storage-v6', // New name for v6 to avoid pollution
            partialize: (state) => ({
                sessions: state.sessions,
                currentSessionId: state.currentSessionId,
                settings: state.settings,
                activeSkin: state.activeSkin
            }),
            onRehydrateStorage: () => (state) => {
                if (!state) return

                // Initial setup if empty
                if (Object.keys(state.sessions).length === 0) {
                    const first = createNewSession('Welcome Thread')
                    state.sessions = { [first.id]: first }
                    state.currentSessionId = first.id
                }

                state.settings = { ...DEFAULT_SETTINGS, ...state.settings }
                
                // Force-migrate any old complex model names to the new LiteLLM aliases
                const validModels = ['ollama-local', 'groq', 'kimi']
                if (!validModels.includes(state.settings.model)) {
                    state.settings.model = 'ollama-local'
                    state.settings.provider = 'ollama'
                }

                if (!state.settings.sttMode) {
                    state.settings.sttMode = 'whisper'
                }
            },
        }
    )
)

