import { useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ComputerBot } from '../components/bot/CubeBot'
import { ChatInput } from '../components/chat/ChatInput'
import { SettingsPanel } from '../components/layout/SettingsPanel'
import { useChatStore } from '../store/useChatStore'
import { useCubeBotChat } from '../hooks/useCubeBotChat'

export function ChatPage() {
    const { messages, isStreaming, setEyeTarget } = useChatStore()
    const { send, stop } = useCubeBotChat()

    // Eye tracking — normalize cursor position to -1..1 from center
    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            const cx = window.innerWidth / 2
            const cy = window.innerHeight / 2
            const x = (e.clientX - cx) / cx
            const y = (e.clientY - cy) / cy
            setEyeTarget({ x, y })
        },
        [setEyeTarget]
    )

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [handleMouseMove])

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-start pt-8 pb-6 px-4">
            {/* Subtle page background dots */}
            <div
                className="fixed inset-0 pointer-events-none opacity-40"
                style={{
                    backgroundImage:
                        'radial-gradient(circle, #e0e0f5 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />

            {/* Top-right settings */}
            <div className="fixed top-4 right-4 z-50">
                <SettingsPanel />
            </div>

            {/* Header */}
            <motion.div
                className="relative text-center mb-6"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h1 className="font-display font-bold text-2xl text-indigo-600 tracking-tight">Desktop CubeBot</h1>
                <p className="text-slate-400 text-xs">Moonshot AI Companion</p>
            </motion.div>

            {/* Computer Bot — chat rendered inside the screen */}
            <motion.div
                className="w-full flex justify-center"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <ComputerBot messages={messages} isStreaming={isStreaming} />
            </motion.div>

            {/* Chat Input — full width on mobile */}
            <motion.div
                className="relative w-full max-w-xl px-0 mt-8 mb-4 sm:px-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
            >
                <div className="input-shell rounded-none sm:rounded-2xl overflow-hidden min-h-[80px]">
                    <ChatInput onSend={send} onStop={stop} isStreaming={isStreaming} />
                </div>
            </motion.div>
        </div>
    )
}
