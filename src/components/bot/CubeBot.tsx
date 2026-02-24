import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatStore } from '../../store/useChatStore'
import type { Message } from '../../types'

// ─── Eye Camera Module ────────────────────────────────────────────────────────
interface EyeProps {
    targetX: number
    targetY: number
    isSpeaking: boolean
    blinkDelay?: number
}

function EyeCam({ targetX, targetY, isSpeaking, blinkDelay = 0 }: EyeProps) {
    const maxLook = 3.5
    const pupilX = Math.max(-maxLook, Math.min(maxLook, targetX * maxLook))
    const pupilY = Math.max(-maxLook, Math.min(maxLook, targetY * maxLook))

    return (
        <div className="flex flex-col items-center gap-0">
            {/* Stalk / arm */}
            <div className="eye-stalk h-5" />
            {/* Camera housing */}
            <div className="eye-module rounded-xl w-10 h-10 flex items-center justify-center relative overflow-hidden">
                {/* Lens barrel ring */}
                <div className="absolute inset-1 rounded-[8px] border border-white/5 bg-black/40" />
                {/* Iris */}
                <motion.div
                    className="relative w-6 h-6 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600 flex items-center justify-center overflow-hidden"
                    animate={{ scaleY: [1, 1, 0.06, 1] }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        repeatDelay: 2,
                        delay: blinkDelay,
                        times: [0, 0.9, 0.93, 1],
                        ease: 'easeInOut',
                    }}
                >
                    {/* Pupil */}
                    <motion.div
                        className="w-3 h-3 rounded-full bg-cubebot-400 relative flex items-center justify-center"
                        animate={{ x: pupilX, y: pupilY }}
                        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                    >
                        {/* Highlight */}
                        <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-white/90" />
                    </motion.div>
                    {/* Speaking iris glow */}
                    {isSpeaking && (
                        <motion.div
                            className="absolute inset-0 rounded-full bg-cubebot-400/30"
                            animate={{ opacity: [0.3, 0.8, 0.3] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                        />
                    )}
                </motion.div>
                {/* LED indicator dot */}
                <motion.div
                    className="absolute top-1 right-1 w-1 h-1 rounded-full"
                    animate={
                        isSpeaking
                            ? { backgroundColor: ['#22c55e', '#86efac', '#22c55e'] }
                            : { backgroundColor: '#ef4444', opacity: [1, 0.5, 1] }
                    }
                    transition={{ duration: isSpeaking ? 0.6 : 1.5, repeat: Infinity }}
                />
            </div>
        </div>
    )
}

// ─── Circular Mouth Display ───────────────────────────────────────────────────
function MouthDisplay({ status }: { status: 'idle' | 'thinking' | 'speaking' | 'error' }) {
    return (
        <div className="mouth-display rounded-full w-16 h-16 flex items-center justify-center overflow-hidden relative">
            {/* Screen glare */}
            <div className="absolute top-1 left-2 w-5 h-2 rounded-full bg-white/8 rotate-[-20deg]" />
            {/* Scanlines overlay */}
            <div className="screen-scanlines absolute inset-0 rounded-full" />

            <AnimatePresence mode="wait">
                {status === 'speaking' && (
                    <motion.div
                        key="speaking"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        className="flex items-end justify-center gap-0.5 h-7 w-full px-2"
                    >
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div
                                key={i}
                                className="mouth-bar flex-1 bg-cubebot-400"
                                style={{ height: '100%' }}
                            />
                        ))}
                    </motion.div>
                )}

                {status === 'thinking' && (
                    <motion.div
                        key="thinking"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex gap-1 items-center"
                    >
                        {[0, 0.15, 0.3].map((delay, i) => (
                            <motion.div
                                key={i}
                                className="w-2 h-2 rounded-full bg-purple-400"
                                animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 0.7, repeat: Infinity, delay }}
                            />
                        ))}
                    </motion.div>
                )}

                {status === 'idle' && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        className="relative w-9 h-9"
                    >
                        {/* Happy arc smile */}
                        <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
                            <path
                                d="M8 16 Q18 28 28 16"
                                stroke="#818cf8"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                fill="none"
                            />
                            {/* Eyes dots */}
                            <circle cx="12" cy="12" r="2" fill="#818cf8" />
                            <circle cx="24" cy="12" r="2" fill="#818cf8" />
                        </svg>
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, rotate: -10 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        <svg viewBox="0 0 36 36" fill="none" className="w-9 h-9">
                            <path
                                d="M8 22 Q18 12 28 22"
                                stroke="#f87171"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                fill="none"
                            />
                            <circle cx="12" cy="13" r="2" fill="#f87171" />
                            <circle cx="24" cy="13" r="2" fill="#f87171" />
                        </svg>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ─── Chat inside Screen ───────────────────────────────────────────────────────
interface ScreenChatProps {
    messages: Message[]
    isStreaming: boolean
}

function formatTime(d: Date) {
    return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function ScreenChat({ messages, isStreaming }: ScreenChatProps) {
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isStreaming])

    if (messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-3 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="text-3xl mb-2">👋</div>
                    <p className="text-indigo-800 text-xs font-semibold">Hi! I'm CubeBot.</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">Ask me anything below.</p>
                </motion.div>
                <div className="flex flex-col gap-1.5 w-full mt-1">
                    {['Explain quantum computing', 'Write a haiku about AI', 'What is RAG?'].map((s) => (
                        <div
                            key={s}
                            className="text-[10px] text-slate-400 px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-center truncate"
                        >
                            {s}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="h-full overflow-y-auto px-2.5 py-2 flex flex-col gap-2">
            <AnimatePresence initial={false}>
                {messages.map((msg, i) => {
                    const isUser = msg.role === 'user'
                    const isLastStreaming = isStreaming && i === messages.length - 1 && !isUser
                    return (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-xl px-2.5 py-1.5 text-[10.5px] leading-relaxed ${isUser ? 'bubble-user rounded-br-sm' : 'bubble-bot rounded-bl-sm'
                                    } ${isLastStreaming ? 'typing-cursor' : ''}`}
                            >
                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                <p className={`text-[9px] mt-0.5 ${isUser ? 'text-indigo-200/70 text-right' : 'text-slate-400'}`}>
                                    {formatTime(msg.timestamp)}
                                </p>
                            </div>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
            <div ref={bottomRef} />
        </div>
    )
}

// ─── Full Computer Caricature ─────────────────────────────────────────────────
interface ComputerBotProps {
    messages: Message[]
    isStreaming: boolean
}

export function ComputerBot({ messages, isStreaming }: ComputerBotProps) {
    const { botState } = useChatStore()
    const { status, eyeTarget } = botState
    const [isPetting, setIsPetting] = useState(false)

    return (
        <motion.div
            className="flex flex-col items-center select-none w-full max-w-[90vw] md:max-w-md"
            animate={isPetting ? {
                scale: [1, 1.05, 1],
                rotate: [0, -2, 2, 0]
            } : { y: [0, -5, 0] }}
            transition={isPetting ? { duration: 0.3 } : { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            onTap={() => {
                setIsPetting(true)
                setTimeout(() => setIsPetting(false), 600)
            }}
        >
            {/* ── Eyes (stereocam) mounted on top ─────── */}
            <div className="flex items-end justify-center gap-6 mb-[-2px] z-10 relative">
                <EyeCam
                    targetX={eyeTarget.x}
                    targetY={eyeTarget.y}
                    isSpeaking={status === 'speaking'}
                    blinkDelay={0}
                />
                <EyeCam
                    targetX={eyeTarget.x}
                    targetY={eyeTarget.y}
                    isSpeaking={status === 'speaking'}
                    blinkDelay={0.6}
                />
            </div>

            {/* ── Monitor body ─────────────────────────── */}
            <div className="monitor-shell rounded-[2.5rem] p-4 w-full aspect-[4/5] md:aspect-square flex flex-col shadow-2xl">
                {/* Top bezel with brand */}
                <div className="flex items-center justify-between mb-3 px-2">
                    <div className="flex gap-1.5">
                        {['#f87171', '#fbbf24', '#34d399'].map((c) => (
                            <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                        ))}
                    </div>
                    <span className="text-xs font-display font-bold text-slate-400 tracking-widest uppercase opacity-60">
                        CubeBot OS v2
                    </span>
                    <div className="w-2.5 h-2.5 rounded-full bg-cubebot-400/60 animate-pulse" />
                </div>

                {/* Screen */}
                <div className="monitor-screen rounded-2xl overflow-hidden relative flex-1 min-h-0">
                    <div className="screen-scanlines absolute inset-0 z-10 pointer-events-none" />
                    <ScreenChat messages={messages} isStreaming={isStreaming} />
                </div>

                {/* Integrated Mouth Display Area */}
                <div className="flex flex-col items-center justify-center py-4 gap-2">
                    <motion.div
                        animate={isPetting ? { scale: 1.2 } : { scale: 1 }}
                        className="cursor-pointer"
                    >
                        <MouthDisplay status={status} />
                    </motion.div>
                    <div className="w-16 h-1.5 rounded-full bg-slate-300/40" />
                </div>
            </div>

            {/* ── Stand neck (slimmed down) ──────────────── */}
            <div className="flex flex-col items-center -mt-1">
                <div className="w-8 h-3 bg-gradient-to-b from-slate-300 to-slate-400" />
                <div className="w-24 h-2.5 rounded-full bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 border border-slate-200 shadow-sm" />
            </div>

            {/* Status pill */}
            <motion.div
                key={status}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 px-4 py-1 rounded-full bg-white shadow-sm border border-slate-100 text-xs text-slate-400 font-medium"
            >
                {status === 'idle' && '● ready'}
                {status === 'thinking' && '◌ processing…'}
                {status === 'speaking' && '◉ listening'}
                {status === 'error' && '✕ error'}
            </motion.div>
        </motion.div>
    )
}
