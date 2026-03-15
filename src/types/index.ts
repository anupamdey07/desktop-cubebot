export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
    id: string
    role: MessageRole
    content: string
    timestamp: Date
}

export interface ChatSession {
    id: string
    title: string
    messages: Message[]
    tags: string[]
    isBookmarked: boolean
    createdAt: Date
    updatedAt: Date
    model?: string
}

export interface BotState {
    status: 'idle' | 'thinking' | 'speaking' | 'error'
    eyeTarget: { x: number; y: number }
}

export type AIProvider = 'kimi' | 'groq' | 'ollama'
export type UISkin = 'cubebot' | 'frontier'

export interface CubeBotSettings {
    provider: AIProvider
    gatewayUrl: string      // LiteLLM Gateway URL
    gatewayKey: string      // LiteLLM Master Key
    whisperUrl: string      // Whisper STT URL (port 8082)
    model: string
    systemPrompt: string
    temperature: number
    maxTokens: number
    // Voice settings
    voiceEnabled: boolean   // auto-speak bot responses
    voiceName: string       // SpeechSynthesisVoice.name ('' = auto-pick)
    voicePitch: number      // 0 – 2 (default 1.5 for cartoon)
    voiceRate: number        // 0.1 – 2 (default 1.15 for snappy)
    sttLang: string         // Engine language
    sttMode: 'whisper' | 'browser' // STT Engine choice
    isUnhinged: boolean     // Chaos mode: bypass system prompt and RAG
}

export interface ChatStore {
    sessions: Record<string, ChatSession>
    currentSessionId: string
    isStreaming: boolean
    botState: BotState
    settings: CubeBotSettings
    lastLatency?: number
    activeSkin: UISkin

    // Actions
    addMessage: (sessionId: string, msg: Omit<Message, 'id' | 'timestamp'>) => Message
    updateLastMessage: (sessionId: string, content: string) => void
    setStreaming: (v: boolean) => void
    setBotStatus: (status: BotState['status']) => void
    setEyeTarget: (pos: { x: number; y: number }) => void
    updateSettings: (s: Partial<CubeBotSettings>) => void
    setLatency: (ms: number) => void
    setSkin: (skin: UISkin) => void
    
    // Session Actions
    createSession: (title?: string) => string
    switchSession: (id: string) => void
    deleteSession: (id: string) => void
    updateSession: (id: string, updates: Partial<ChatSession>) => void
    clearHistory: () => void
}
