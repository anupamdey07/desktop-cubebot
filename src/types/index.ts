export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
    id: string
    role: MessageRole
    content: string
    timestamp: Date
}

export interface BotState {
    status: 'idle' | 'thinking' | 'speaking' | 'error'
    eyeTarget: { x: number; y: number }
}

export type AIProvider = 'kimi' | 'groq' | 'ollama'

export interface CubeBotSettings {
    provider: AIProvider
    gatewayUrl: string      // LiteLLM Gateway URL
    gatewayKey: string      // LiteLLM Master Key
    model: string
    systemPrompt: string
    temperature: number
    maxTokens: number
    // Voice settings
    voiceEnabled: boolean   // auto-speak bot responses
    voiceName: string       // SpeechSynthesisVoice.name ('' = auto-pick)
    voicePitch: number      // 0 – 2 (default 1.5 for cartoon)
    voiceRate: number        // 0.1 – 2 (default 1.15 for snappy)
    sttLang: string         // SpeechRecognition.lang
    isUnhinged: boolean     // Chaos mode: bypass system prompt and RAG
}

export interface ChatStore {
    messages: Message[]
    isStreaming: boolean
    botState: BotState
    settings: CubeBotSettings
    addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => Message
    updateLastMessage: (content: string) => void
    setStreaming: (v: boolean) => void
    setBotStatus: (status: BotState['status']) => void
    setEyeTarget: (pos: { x: number; y: number }) => void
    updateSettings: (s: Partial<CubeBotSettings>) => void
    clearHistory: () => void
}
