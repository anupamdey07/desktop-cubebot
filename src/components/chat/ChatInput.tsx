import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, StopCircle, Mic, MicOff, Volume2 } from 'lucide-react'
import {
    isSTTSupported,
    startListening,
    stopListening,
    isTTSSupported,
    stopSpeaking,
    isSpeaking as checkSpeaking,
    preloadVoices,
} from '../../services/voiceService'

interface ChatInputProps {
    onSend: (text: string) => void
    onStop: () => void
    isStreaming: boolean
    disabled?: boolean
}

export function ChatInput({ onSend, onStop, isStreaming, disabled }: ChatInputProps) {
    const [text, setText] = useState('')
    const [isListening, setIsListening] = useState(false)
    const [isSpeakingNow, setIsSpeakingNow] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const canSend = text.trim().length > 0 && !isStreaming && !disabled
    const hasVoice = isSTTSupported()
    const hasTTS = isTTSSupported()

    // Preload voices on mount
    useEffect(() => {
        preloadVoices()
    }, [])

    // Poll speaking state for UI
    useEffect(() => {
        if (!isSpeakingNow) return
        const interval = setInterval(() => {
            if (!checkSpeaking()) setIsSpeakingNow(false)
        }, 200)
        return () => clearInterval(interval)
    }, [isSpeakingNow])

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

    const handleMicToggle = () => {
        if (isListening) {
            stopListening()
            setIsListening(false)
            return
        }

        setIsListening(true)
        startListening({
            onResult: (transcript) => {
                setText((prev) => (prev ? prev + ' ' + transcript : transcript))
                setIsListening(false)
            },
            onEnd: () => {
                setIsListening(false)
            },
            onError: (err) => {
                console.warn('STT error:', err)
                setIsListening(false)
            },
        })
    }

    const handleStopSpeaking = () => {
        stopSpeaking()
        setIsSpeakingNow(false)
    }

    return (
        <div className="flex items-end gap-2 p-3">
            {/* Mic button */}
            {hasVoice && (
                <motion.button
                    onClick={handleMicToggle}
                    className={`mb-0.5 w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${isListening
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 border border-slate-200'
                        }`}
                    whileTap={{ scale: 0.9 }}
                    title={isListening ? 'Stop listening' : 'Voice input'}
                >
                    {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                </motion.button>
            )}

            {/* Text area */}
            <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={handleInput}
                placeholder={isListening ? 'Listening…' : 'Message CubeBot…'}
                disabled={disabled || isListening}
                rows={1}
                className="flex-1 bg-transparent resize-none border-0 outline-none text-sm text-slate-700 placeholder-slate-400 py-2 leading-relaxed max-h-28 font-sans"
            />

            {/* Stop speaking button */}
            {hasTTS && isSpeakingNow && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    onClick={handleStopSpeaking}
                    className="mb-0.5 w-9 h-9 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-400 transition-colors flex-shrink-0"
                    title="Stop speaking"
                >
                    <Volume2 size={14} />
                </motion.button>
            )}

            {/* Send / Stop buttons */}
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
