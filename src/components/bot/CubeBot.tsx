import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useChatStore } from '../../store/useChatStore'
import type { Message } from '../../types'

// ─── Stereocam Lens (with lens flare + PCB ring) ─────────────────────────────
interface EyeLensProps {
    targetX: number
    targetY: number
    isSpeaking: boolean
    blinkDelay: number
    side: 'left' | 'right'
}

function EyeLens({ targetX, targetY, isSpeaking, blinkDelay, side }: EyeLensProps) {
    const pupilX = targetX * 3
    const pupilY = targetY * 3

    return (
        <div className="flex flex-col items-center">
            {/* Lens housing — 3D-printed look */}
            <motion.div
                className="w-12 h-12 rounded-full relative"
                style={{
                    background: 'conic-gradient(from 0deg, #1a1a2e, #252540, #1a1a2e, #252540, #1a1a2e)',
                    border: '3px solid #333',
                    boxShadow:
                        'inset 0 2px 8px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.4), 0 0 0 2px #555',
                }}
                animate={{ scaleY: [1, 1, 1, 0.08, 1] }}
                transition={{
                    duration: 4.2,
                    repeat: Infinity,
                    delay: blinkDelay,
                    times: [0, 0.92, 0.93, 0.96, 1],
                }}
            >
                {/* Blue iris — glass lens effect */}
                <div
                    className="absolute inset-[5px] rounded-full overflow-hidden"
                    style={{
                        background: 'radial-gradient(circle at 38% 38%, #5599ff, #2266cc 55%, #0a2244 90%)',
                        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5)',
                    }}
                >
                    {/* Lens flare highlight */}
                    <div
                        className="absolute w-3 h-1.5 rounded-full bg-white/30 blur-[1px]"
                        style={{ top: '20%', left: '25%', transform: 'rotate(-20deg)' }}
                    />
                </div>

                {/* Pupil */}
                <motion.div
                    className="absolute w-3.5 h-3.5 rounded-full"
                    style={{
                        background: 'radial-gradient(circle at 40% 40%, #1a1a1a, #000)',
                        top: '50%',
                        left: '50%',
                        marginTop: -7,
                        marginLeft: -7,
                    }}
                    animate={{ x: pupilX, y: pupilY }}
                    transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                >
                    <div className="w-1 h-1 bg-white/90 rounded-full absolute top-0.5 left-1" />
                    <div className="w-0.5 h-0.5 bg-white/40 rounded-full absolute bottom-1 right-0.5" />
                </motion.div>

                {/* Speaking pulse */}
                {isSpeaking && (
                    <motion.div
                        className="absolute -inset-1 rounded-full border-2 border-blue-400/40"
                        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                    />
                )}
            </motion.div>
            {/* Label under lens */}
            <span className="text-[7px] font-mono text-zinc-500 mt-0.5 tracking-widest uppercase">
                cam-{side === 'left' ? 'L' : 'R'}
            </span>
        </div>
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
            <div className="flex items-center justify-center h-full gap-1.5">
                <motion.span
                    className="text-base"
                    animate={{ scale: [1, 1.4, 1], rotate: [0, 20, -20, 0] }}
                    transition={{ duration: 0.4, repeat: 2 }}
                >
                    💚
                </motion.span>
                <span className="text-green-400 text-[10px] font-mono">*purrs*</span>
            </div>
        )
    }

    if (status === 'speaking') {
        const colors = [
            'bg-green-400', 'bg-emerald-400', 'bg-cyan-400',
            'bg-blue-400', 'bg-indigo-400', 'bg-violet-400',
            'bg-fuchsia-400', 'bg-pink-400', 'bg-rose-400'
        ]
        return (
            <div className="flex items-end justify-between gap-[1px] h-full pb-2 px-2 w-full overflow-hidden">
                {Array.from({ length: 42 }).map((_, i) => (
                    <div
                        key={i}
                        className={`mouth-bar ${colors[i % colors.length]}`}
                        style={{
                            width: 3,
                            height: '100%',
                            maxHeight: 24,
                            animationDelay: `${(i * 0.03) % 0.4}s`,
                        }}
                    />
                ))}
            </div>
        )
    }

    if (status === 'thinking') {
        return (
            <div className="flex items-center justify-center h-full gap-1">
                <span className="text-green-500/60 text-[9px] font-mono mr-1">{'>'}</span>
                {[0, 0.15, 0.3].map((d) => (
                    <motion.div
                        key={d}
                        className="w-1.5 h-1.5 rounded-full bg-green-400"
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1, repeat: Infinity, delay: d }}
                    />
                ))}
                <span className="text-green-500/60 text-[9px] font-mono ml-1 lcd-cursor" />
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="flex items-center justify-center h-full gap-1">
                <span className="text-red-400 text-[10px] font-mono">{'[!]'} FAULT</span>
            </div>
        )
    }

    // Idle — EKG-style heartbeat
    return (
        <div className="flex items-end justify-center gap-[2px] h-full pb-2.5 px-3">
            {[3, 4, 3, 5, 8, 16, 22, 16, 8, 5, 3, 4, 3, 3, 4].map((h, i) => (
                <motion.div
                    key={i}
                    className="bg-green-500/60 rounded-sm"
                    style={{ width: 2 }}
                    animate={{ height: [h, h * 0.5, h] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.12 }}
                />
            ))}
        </div>
    )
}

// ─── Terminal Chat inside LCD ─────────────────────────────────────────────────
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
                    transition={{ delay: 0.3 }}
                    className="space-y-1"
                >
                    <p className="text-green-400/80 text-[9px] font-mono">┌──────────────────┐</p>
                    <p className="text-green-300 text-[11px] font-mono font-bold">CUBEBOT v2.0</p>
                    <p className="text-green-500/50 text-[9px] font-mono">NVIDIA Jetson · Edge AI</p>
                    <p className="text-green-400/80 text-[9px] font-mono">└──────────────────┘</p>
                    <p className="text-green-500/40 text-[8px] font-mono mt-2">{'>'} awaiting input_</p>
                </motion.div>
            </div>
        )
    }

    return (
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-2.5 space-y-1.5 scroll-smooth">
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
                                    ? 'bg-green-900/30 text-green-300 border border-green-700/30'
                                    : 'bg-green-950/20 text-green-400/90 border border-green-800/20'
                                } ${isLast && isStreaming ? 'lcd-cursor' : ''}`}
                        >
                            {!isUser && (
                                <span className="text-green-600/50 text-[8px]">{'>'} </span>
                            )}
                            <p className="whitespace-pre-wrap break-words inline">{msg.content}</p>
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}

// ─── Hex Bolt Component ───────────────────────────────────────────────────────
function HexBolt({ className = '' }: { className?: string }) {
    return (
        <div
            className={`w-3 h-3 rounded-full relative ${className}`}
            style={{
                background: 'conic-gradient(from 30deg, #3a3a3a, #555, #3a3a3a, #555, #3a3a3a, #555)',
                border: '1px solid #2a2a2a',
                boxShadow: 'inset 0 0 2px rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.4)',
            }}
        >
            {/* Hex socket */}
            <div
                className="absolute inset-[3px] rounded-sm"
                style={{
                    background: '#1a1a1a',
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }}
            />
        </div>
    )
}

// ─── Full Cube Robot V2 ───────────────────────────────────────────────────────
interface CubeBotProps {
    messages: Message[]
    isStreaming: boolean
}

export function ComputerBot({ messages, isStreaming }: CubeBotProps) {
    const { botState, settings, lastLatency } = useChatStore()
    const { status, eyeTarget } = botState
    const [isPetting, setIsPetting] = useState(false)

    // Helper to format latency and pick a color
    const getLatencyColor = (ms: number) => {
        if (ms < 300) return 'text-green-500'
        if (ms < 1000) return 'text-amber-500'
        return 'text-rose-400'
    }

    return (
        <motion.div
            className="flex flex-col items-center select-text w-full max-w-[92vw] sm:max-w-sm"
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
            {/* ── Top rail — 3D-printed frame with layer lines ── */}
            <div className="relative w-full">
                {/* Antenna */}
                <div className="absolute -top-10 right-8 flex flex-col items-center z-10">
                    <motion.div
                        className="w-2 h-2 rounded-full"
                        style={{
                            background: 'radial-gradient(circle at 35% 35%, #ff5555, #cc2222)',
                            boxShadow: '0 0 6px rgba(255,60,60,0.5)',
                        }}
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <div
                        className="w-[2px] h-8"
                        style={{ background: 'linear-gradient(to bottom, #444, #666, #444)' }}
                    />
                    {/* Antenna base mount */}
                    <div className="w-3 h-1.5 rounded-sm bg-zinc-600 border-x border-zinc-500" />
                </div>

                {/* Top frame bar */}
                <div
                    className="h-5 rounded-t-xl mx-2 relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(180deg, #a0b896 0%, #8da683 100%)',
                        borderTop: '1.5px solid #b5c9ab',
                    }}
                >
                    {/* 3D print layer lines */}
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 3px)',
                        }}
                    />
                    {/* Hex bolts */}
                    <HexBolt className="absolute top-1 left-2" />
                    <HexBolt className="absolute top-1 right-2" />
                    {/* Vent slots */}
                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-3 h-1 rounded-full bg-black/15" />
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Main Cube Body ────────────────────────── */}
            <div
                className="w-[calc(100%-1rem)] relative flex flex-col"
                style={{
                    background: 'linear-gradient(170deg, #96ab8d 0%, #849e7a 40%, #7a9470 100%)',
                    borderLeft: '4px solid #6d8564',
                    borderRight: '4px solid #6d8564',
                    boxShadow:
                        '5px 5px 0 #5a7350, -1px 0 0 #aabfa2, inset 0 0 24px rgba(0,0,0,0.05)',
                }}
            >
                {/* 3D-printed layer texture overlay */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-15"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)',
                    }}
                />

                {/* Black corner pillars with hex bolts */}
                <div className="absolute top-0 bottom-0 left-0 w-3 z-20" style={{ background: 'linear-gradient(90deg, #1a1a1a, #2d2d2d)' }}>
                    <HexBolt className="absolute top-2 left-0" />
                    <HexBolt className="absolute bottom-2 left-0" />
                </div>
                <div className="absolute top-0 bottom-0 right-0 w-3 z-20" style={{ background: 'linear-gradient(90deg, #2d2d2d, #1a1a1a)' }}>
                    <HexBolt className="absolute top-2 right-0" />
                    <HexBolt className="absolute bottom-2 right-0" />
                </div>

                {/* ── Eyes Row ──────────────────────────────── */}
                <div className="flex items-center justify-center gap-4 py-3 relative z-10">
                    <EyeLens
                        targetX={eyeTarget.x}
                        targetY={eyeTarget.y}
                        isSpeaking={status === 'speaking'}
                        blinkDelay={0}
                        side="left"
                    />
                    {/* Center hardware — IR sensor + screws */}
                    <div className="flex flex-col items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-zinc-700 border border-zinc-600" />
                        <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                                background: 'radial-gradient(circle, #ff2222, #880000)',
                                boxShadow: '0 0 3px rgba(255,0,0,0.3)',
                            }}
                        />
                        <div className="w-2 h-2 rounded-full bg-zinc-700 border border-zinc-600" />
                    </div>
                    <EyeLens
                        targetX={eyeTarget.x}
                        targetY={eyeTarget.y}
                        isSpeaking={status === 'speaking'}
                        blinkDelay={0.7}
                        side="right"
                    />
                </div>

                {/* ── LCD Screen Area ────────────────────────── */}
                <div className="px-6 pb-4 relative z-10">
                    {/* Exposed wire harness above screen */}
                    <div className="flex items-center justify-center gap-3 mb-1.5">
                        <div className="h-[1.5px] w-6 bg-red-500/60 rounded-full" />
                        <div className="h-[1.5px] w-4 bg-yellow-400/50 rounded-full" />
                        <div className="h-[1.5px] w-8 bg-blue-400/40 rounded-full" />
                        <div className="h-[1.5px] w-3 bg-green-400/50 rounded-full" />
                    </div>

                    {/* Screen bezel — industrial look */}
                    <div
                        className="rounded-lg overflow-hidden relative"
                        style={{
                            border: '3px solid #2a2a2a',
                            boxShadow:
                                'inset 0 2px 10px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px #444',
                        }}
                    >
                        {/* Screen bracket screws */}
                        <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-zinc-500/60 z-30" />
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-zinc-500/60 z-30" />
                        <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-zinc-500/60 z-30" />
                        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-zinc-500/60 z-30" />

                        {/* LCD Screen */}
                        <div
                            className="flex flex-col relative"
                            style={{
                                background: 'linear-gradient(180deg, #071207 0%, #0d1f0d 50%, #060e06 100%)',
                                minHeight: 200,
                                maxHeight: '55vh',
                            }}
                        >
                            {/* Scanlines */}
                            <div
                                className="absolute inset-0 pointer-events-none z-20 opacity-15"
                                style={{
                                    backgroundImage:
                                        'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.04) 2px, rgba(0,255,0,0.04) 3px)',
                                }}
                            />
                            {/* Screen edge glow */}
                            <div
                                className="absolute inset-0 pointer-events-none z-20"
                                style={{
                                    boxShadow: 'inset 0 0 30px rgba(0,255,0,0.03)',
                                }}
                            />

                            {/* Chat or empty state */}
                            {messages.length > 0 || isStreaming ? (
                                <ScreenChat messages={messages} isStreaming={isStreaming} />
                            ) : (
                                <div className="flex flex-col h-[200px]">
                                    <div className="flex-1">
                                        <ScreenChat messages={messages} isStreaming={isStreaming} />
                                    </div>
                                    <div className="h-9 border-t border-green-900/40">
                                        <LCDDisplay status={status} isPetting={isPetting} />
                                    </div>
                                </div>
                            )}

                            {/* Status waveform bar at bottom when chatting */}
                            {messages.length > 0 && (
                                <div className="h-8 border-t border-green-900/40 flex-shrink-0">
                                    <LCDDisplay status={status} isPetting={isPetting} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* PCB trace decoration below screen */}
                    <div className="flex items-center justify-between mt-1.5 px-1">
                        <div className="flex gap-1">
                            <div className="w-1 h-1 rounded-full bg-green-600/40" />
                            <div className="w-6 h-[1px] bg-green-700/30 self-center" />
                            <div className="w-1 h-1 rounded-full bg-green-600/40" />
                        </div>
                        <span className="text-[6px] font-mono text-zinc-500/50 tracking-wider">PCB-REV3.1</span>
                        <div className="flex gap-1">
                            <div className="w-1 h-1 rounded-full bg-green-600/40" />
                            <div className="w-6 h-[1px] bg-green-700/30 self-center" />
                            <div className="w-1 h-1 rounded-full bg-green-600/40" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Bottom rail ───────────────────────────── */}
            <div
                className="h-5 rounded-b-xl mx-2 w-[calc(100%-1rem)] relative overflow-hidden"
                style={{
                    background: 'linear-gradient(0deg, #7a9470 0%, #8da683 100%)',
                    borderBottom: '1.5px solid #6d8564',
                }}
            >
                {/* Layer lines */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 3px)',
                    }}
                />
                <HexBolt className="absolute bottom-1 left-2" />
                <HexBolt className="absolute bottom-1 right-2" />
            </div>

            {/* ── Rubber feet ───────────────────────────── */}
            <div className="flex justify-between w-[75%] mt-0.5">
                <div className="w-4 h-2 rounded-b-lg bg-zinc-800 shadow-md" />
                <div className="w-4 h-2 rounded-b-lg bg-zinc-800 shadow-md" />
            </div>

            <motion.div
                key={status}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 px-4 py-1 rounded-full bg-white/90 shadow-sm border border-slate-100 text-[10px] text-slate-400 font-mono tracking-wide flex items-center gap-2"
            >
                <div className="flex items-center gap-1.5">
                    <span className={status === 'error' ? 'text-rose-500' : 'text-green-500'}>
                        {status === 'idle' && '●'}
                        {status === 'thinking' && '◌'}
                        {status === 'speaking' && '◉'}
                        {status === 'error' && '✕'}
                    </span>
                    <span>
                        {status === 'idle' && 'ONLINE'}
                        {status === 'thinking' && 'PROCESSING'}
                        {status === 'speaking' && 'TRANSMITTING'}
                        {status === 'error' && 'FAULT'}
                    </span>
                </div>
                <div className="w-[1px] h-2 bg-slate-200" />
                <div className="opacity-60 text-[9px] lowercase flex items-center gap-1.5">
                    <span>prepared by {settings.model}</span>
                    {lastLatency && (
                        <>
                            <span className="text-[10px] opacity-40">/</span>
                            <span className={getLatencyColor(lastLatency)}>
                                {lastLatency}ms
                            </span>
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    )
}
