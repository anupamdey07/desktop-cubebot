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

export interface CubeBotSettings {
    apiKey: string
    model: string
    systemPrompt: string
    temperature: number
    maxTokens: number
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
