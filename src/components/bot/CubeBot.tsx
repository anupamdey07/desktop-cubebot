import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatStore } from '../../store/useChatStore'
import type { Message } from '../../types'

// ─── Eye Lens (blue stereocam embedded in cube face) ──────────────────────────
interface EyeLensProps {
    targetX: number
    targetY: number
    isSpeaking: boolean
    blinkDelay: number
}

function EyeLens({ targetX, targetY, isSpeaking, blinkDelay }: EyeLensProps) {
    const pupilX = targetX * 2.5
    const pupilY = targetY * 2.5

    return (
        <motion.div
            className="w-10 h-10 rounded-full relative"
            style={{
                background: 'radial-gradient(circle at 35% 35%, #1a1a2e, #0a0a14)',
                border: '2.5px solid #2a2a3a',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.3)',
            }}
            animate={{ scaleY: [1, 1, 1, 0.1, 1] }}
            transition={{
                duration: 4,
                repeat: Infinity,
                delay: blinkDelay,
                times: [0, 0.92, 0.93, 0.96, 1],
            }}
        >
            {/* Blue iris ring */}
            <div
                className="absolute inset-1 rounded-full"
                style={{
                    background: 'radial-gradient(circle at 40% 40%, #4488ff, #2255bb 60%, #112244)',
                    boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.4)',
                }}
            />
            {/* Pupil */}
            <motion.div
                className="absolute w-3 h-3 rounded-full"
                style={{
                    background: 'radial-gradient(circle at 35% 35%, #111, #000)',
                    top: '50%',
                    left: '50%',
                    marginTop: -6,
                    marginLeft: -6,
                }}
                animate={{ x: pupilX, y: pupilY }}
                transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            >
                {/* Highlight dot */}
                <div className="w-1 h-1 bg-white/80 rounded-full absolute top-0.5 left-0.5" />
            </motion.div>
            {/* Speaking glow */}
            {isSpeaking && (
                <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(68,136,255,0.3), transparent)' }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                />
            )}
        </motion.div>
    )
}

// ─── LCD Waveform Display ─────────────────────────────────────────────────────
interface LCDDisplayProps {
    status: string
    isPetting: boolean
}

function LCDDisplay({ status, isPetting }: LCDDisplayProps) {
    if (isPetting) {
        return (
            <div className="flex items-center justify-center h-full gap-1">
                <motion.span
                    className="text-lg"
                    animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 0.4, repeat: 2 }}
                >
                    💚
                </motion.span>
                <span className="text-green-400 text-xs font-mono">happy!</span>
            </div>
        )
    }

    if (status === 'speaking') {
        return (
            <div className="flex items-end justify-center gap-[3px] h-full pb-2">
                {Array.from({ length: 9 }).map((_, i) => (
                    <div
                        key={i}
                        className="mouth-bar bg-green-400"
                        style={{
                            width: 4,
                            height: '100%',
                            maxHeight: 28,
                            animationDelay: `${i * 0.06}s`,
                        }}
                    />
                ))}
            </div>
        )
    }

    if (status === 'thinking') {
        return (
            <div className="flex items-center justify-center h-full gap-2">
                {[0, 0.2, 0.4].map((d) => (
                    <motion.div
                        key={d}
                        className="w-2 h-2 rounded-full bg-green-400"
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: d }}
                    />
                ))}
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="flex items-center justify-center h-full">
                <span className="text-red-400 text-xs font-mono">! ERR</span>
            </div>
        )
    }

    // Idle — flat waveform / heartbeat
    return (
        <div className="flex items-end justify-center gap-[3px] h-full pb-3">
            {[4, 6, 10, 14, 18, 14, 10, 6, 4].map((h, i) => (
                <motion.div
                    key={i}
                    className="bg-green-500/70 rounded-sm"
                    style={{ width: 3 }}
                    animate={{ height: [h, h * 0.6, h] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                />
            ))}
        </div>
    )
}

// ─── Chat Screen inside LCD ───────────────────────────────────────────────────
interface ScreenChatProps {
    messages: Message[]
    isStreaming: boolean
}

function ScreenChat({ messages, isStreaming }: ScreenChatProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isStreaming])

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="text-2xl mb-1">🔩</div>
                    <p className="text-green-300 text-[10px] font-mono font-semibold">CUBEBOT v2.0</p>
                    <p className="text-green-500/60 text-[9px] font-mono mt-0.5">READY FOR INPUT</p>
                </motion.div>
            </div>
        )
    }

    return (
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1.5 scroll-smooth">
            {messages.map((msg, i) => {
                const isUser = msg.role === 'user'
                const isLast = i === messages.length - 1
                return (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] rounded px-2 py-1 text-[10px] leading-relaxed font-mono ${isUser
                                    ? 'bg-green-900/40 text-green-300 border border-green-700/40'
                                    : 'bg-green-950/30 text-green-400 border border-green-800/30'
                                } ${isLast && isStreaming ? 'lcd-cursor' : ''}`}
                        >
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}

// ─── Full Cube Robot ──────────────────────────────────────────────────────────
interface CubeBotProps {
    messages: Message[]
    isStreaming: boolean
}

export function ComputerBot({ messages, isStreaming }: CubeBotProps) {
    const { botState } = useChatStore()
    const { status, eyeTarget } = botState
    const [isPetting, setIsPetting] = useState(false)

    return (
        <motion.div
            className="flex flex-col items-center select-none w-full max-w-[92vw] sm:max-w-sm"
            animate={
                isPetting
                    ? { scale: [1, 1.04, 1], rotate: [0, -1.5, 1.5, 0] }
                    : { y: [0, -3, 0] }
            }
            transition={
                isPetting
                    ? { duration: 0.35 }
                    : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
            }
            onTap={() => {
                setIsPetting(true)
                setTimeout(() => setIsPetting(false), 700)
            }}
        >
            {/* ── Top Frame Rail + Antenna ──────────────── */}
            <div className="relative w-full">
                {/* Antenna */}
                <div className="absolute -top-8 right-6 flex flex-col items-center z-10">
                    <div className="w-2 h-2 rounded-full bg-red-400 shadow-md shadow-red-400/40" />
                    <div
                        className="w-[2px] h-7"
                        style={{ background: 'linear-gradient(to bottom, #333, #555)' }}
                    />
                </div>

                {/* Top rail with bolts */}
                <div
                    className="h-4 rounded-t-lg mx-4 relative"
                    style={{
                        background: 'linear-gradient(180deg, #96ab8d 0%, #829c78 100%)',
                        borderTop: '1px solid #aabfa2',
                    }}
                >
                    {/* Corner bolts */}
                    <div className="absolute top-0.5 left-1 w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-600 shadow-inner" />
                    <div className="absolute top-0.5 right-1 w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-600 shadow-inner" />
                </div>
            </div>

            {/* ── Main Cube Body ────────────────────────── */}
            <div
                className="w-full relative flex flex-col"
                style={{
                    background: 'linear-gradient(160deg, #9ab691 0%, #849e7a 50%, #7a9470 100%)',
                    borderLeft: '3px solid #6d8564',
                    borderRight: '3px solid #6d8564',
                    boxShadow:
                        '4px 4px 0 #5a7350, -1px 0 0 #aabfa2, inset 0 0 20px rgba(0,0,0,0.06)',
                }}
            >
                {/* Black vertical corner pillars */}
                <div className="absolute top-0 bottom-0 left-0 w-2" style={{ background: 'linear-gradient(90deg, #1a1a1a, #333)' }} />
                <div className="absolute top-0 bottom-0 right-0 w-2" style={{ background: 'linear-gradient(90deg, #333, #1a1a1a)' }} />

                {/* ── Eyes Row ──────────────────────────────── */}
                <div className="flex items-center justify-center gap-5 py-3 relative z-10">
                    <EyeLens
                        targetX={eyeTarget.x}
                        targetY={eyeTarget.y}
                        isSpeaking={status === 'speaking'}
                        blinkDelay={0}
                    />
                    {/* Small screws between eyes */}
                    <div className="flex flex-col gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 border border-zinc-400" />
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 border border-zinc-400" />
                    </div>
                    <EyeLens
                        targetX={eyeTarget.x}
                        targetY={eyeTarget.y}
                        isSpeaking={status === 'speaking'}
                        blinkDelay={0.7}
                    />
                </div>

                {/* ── LCD Screen Area ────────────────────────── */}
                <div className="px-5 pb-4 relative z-10">
                    {/* Screen bezel */}
                    <div
                        className="rounded-lg overflow-hidden"
                        style={{
                            border: '2.5px solid #3a3a3a',
                            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.1)',
                        }}
                    >
                        {/* LCD Screen */}
                        <div
                            className="flex flex-col"
                            style={{
                                background: 'linear-gradient(180deg, #0a1a0a 0%, #0d1f0d 50%, #081408 100%)',
                                minHeight: 180,
                                maxHeight: '50vh',
                            }}
                        >
                            {/* Scanlines overlay */}
                            <div
                                className="absolute inset-0 pointer-events-none z-20 opacity-20"
                                style={{
                                    backgroundImage:
                                        'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.03) 2px, rgba(0,255,0,0.03) 3px)',
                                }}
                            />

                            {/* Waveform / Chat content */}
                            {messages.length > 0 || isStreaming ? (
                                <ScreenChat messages={messages} isStreaming={isStreaming} />
                            ) : (
                                <div className="flex flex-col h-[180px]">
                                    <div className="flex-1">
                                        <ScreenChat messages={messages} isStreaming={isStreaming} />
                                    </div>
                                    <div className="h-10 border-t border-green-900/40">
                                        <LCDDisplay status={status} isPetting={isPetting} />
                                    </div>
                                </div>
                            )}

                            {/* Status waveform bar at bottom when chatting */}
                            {messages.length > 0 && (
                                <div
                                    className="h-8 border-t border-green-900/50 flex-shrink-0"
                                >
                                    <LCDDisplay status={status} isPetting={isPetting} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Bottom Frame Rail ─────────────────────── */}
            <div
                className="h-4 rounded-b-lg mx-4 w-[calc(100%-2rem)] relative"
                style={{
                    background: 'linear-gradient(0deg, #7a9470 0%, #8da683 100%)',
                    borderBottom: '1px solid #6d8564',
                }}
            >
                <div className="absolute bottom-0.5 left-1 w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-600 shadow-inner" />
                <div className="absolute bottom-0.5 right-1 w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-600 shadow-inner" />
            </div>

            {/* ── Feet (rubber bumpers) ──────────────────── */}
            <div className="flex justify-between w-[70%] mt-0.5">
                <div className="w-3 h-1.5 rounded-b bg-zinc-700" />
                <div className="w-3 h-1.5 rounded-b bg-zinc-700" />
            </div>

            {/* Status pill */}
            <motion.div
                key={status}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 px-4 py-1 rounded-full bg-white/90 shadow-sm border border-slate-100 text-xs text-slate-400 font-mono"
            >
                {status === 'idle' && '● ONLINE'}
                {status === 'thinking' && '◌ PROCESSING…'}
                {status === 'speaking' && '◉ SPEAKING'}
                {status === 'error' && '✕ ERROR'}
            </motion.div>
        </motion.div>
    )
}
