import { useState, useRef, type KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, StopCircle } from 'lucide-react'

interface ChatInputProps {
    onSend: (text: string) => void
    onStop: () => void
    isStreaming: boolean
    disabled?: boolean
}

export function ChatInput({ onSend, onStop, isStreaming, disabled }: ChatInputProps) {
    const [text, setText] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const canSend = text.trim().length > 0 && !isStreaming && !disabled

    const handleSend = () => {
        if (!canSend) return
        onSend(text.trim())
        setText('')
        if (textareaRef.current) textareaRef.current.style.height = 'auto'
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleInput = () => {
        const el = textareaRef.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    }

    return (
        <div className="flex items-end gap-2 p-3">
            <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={handleInput}
                placeholder="Message CubeBot…"
                disabled={disabled}
                rows={1}
                className="flex-1 bg-transparent resize-none border-0 outline-none text-sm text-slate-700 placeholder-slate-400 py-2 leading-relaxed max-h-28 font-sans"
            />
            <AnimatePresence mode="wait">
                {isStreaming ? (
                    <motion.button
                        key="stop"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        onClick={onStop}
                        className="mb-0.5 w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 flex items-center justify-center text-red-400 transition-colors flex-shrink-0"
                    >
                        <StopCircle size={16} />
                    </motion.button>
                ) : (
                    <motion.button
                        key="send"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        onClick={handleSend}
                        disabled={!canSend}
                        className="mb-0.5 w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all flex-shrink-0 shadow-md"
                    >
                        <Send size={14} />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    )
}
