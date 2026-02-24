import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Clock, Bot, Volume2 } from 'lucide-react'
import { useChatStore } from '../../store/useChatStore'
import { speakWithMood } from '../../services/voiceService'
import type { Message } from '../../types'

interface ChatMessageProps {
    message: Message
    isStreaming?: boolean
}

function formatTime(date: Date) {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
    const { settings } = useChatStore()
    const isUser = message.role === 'user'

    return (
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}
        >
            {/* Avatar */}
            <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mb-0.5 ${isUser
                    ? 'bg-gradient-to-br from-cubebot-500 to-purple-600'
                    : 'bg-gradient-to-br from-surface-2 to-surface-3 border border-cubebot-400/25'
                    }`}
            >
                {isUser ? (
                    <User size={10} className="text-white" />
                ) : (
                    <span className="text-cubebot-400 text-xs font-bold">C</span>
                )}
            </div>

            {/* Bubble */}
            <div
                className={`group relative max-w-[85%] rounded-xl px-2.5 py-1.5 text-[10.5px] leading-relaxed ${isUser
                    ? 'bg-gradient-to-br from-cubebot-600 to-cubebot-700 text-white rounded-br-sm'
                    : 'bg-white text-slate-700 border border-slate-100 rounded-bl-sm shadow-sm'
                    } ${isStreaming ? 'typing-cursor' : ''}`}
            >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                <div
                    className={`flex items-center gap-2 text-[9px] mt-1.5 ${isUser ? 'text-cubebot-200/60 justify-end' : 'text-slate-500'
                        }`}
                >
                    {formatTime(message.timestamp)}

                    {!isUser && !isStreaming && (
                        <button
                            onClick={() => speakWithMood(message.content, settings)}
                            className="p-1 rounded-md hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 duration-200"
                            title="Read aloud"
                        >
                            <Volume2 size={10} className="text-cubebot-400" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

// ─── Chat History ─────────────────────────────────────────────────────────────
interface ChatHistoryProps {
    messages: Message[]
    isStreaming: boolean
}

interface EmptyStateProps {
    onStarterClick: (text: string) => void
}

const STARTERS = [
    'How can you help me today?',
    'Tell me a fun fact about desktop robots.',
    'Write a short poem about code.',
]

export function EmptyState({ onStarterClick }: EmptyStateProps) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4"
            >
                <div className="w-12 h-12 rounded-2xl bg-cubebot-50 flex items-center justify-center text-cubebot-500 mb-3 mx-auto">
                    <Bot size={24} />
                </div>
                <h3 className="text-slate-700 font-bold text-sm">Desktop CubeBot</h3>
                <p className="text-slate-400 text-[10px] mt-1 max-w-[180px]">
                    Your intelligent desktop companion is ready to chat.
                </p>
            </motion.div>

            <div className="flex flex-col gap-1.5 w-full mt-2">
                {STARTERS.map((s) => (
                    <button
                        key={s}
                        onClick={() => onStarterClick(s)}
                        className="px-3 py-1.5 rounded-full glass-light text-xs text-slate-400 cursor-default hover:text-cubebot-300 hover:border-cubebot-400/30 transition-colors duration-200"
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>
    )
}

export function ChatHistory({ messages, isStreaming }: ChatHistoryProps) {
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isStreaming])

    if (messages.length === 0) {
        return (
            <EmptyState onStarterClick={() => { /* handle starter click */ }} />
        )
    }

    return (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                    <ChatMessage
                        key={msg.id}
                        message={msg}
                        isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
                    />
                ))}
            </AnimatePresence>
            <div ref={bottomRef} />
        </div>
    )
}
