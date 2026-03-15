import { useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { ComputerBot } from '../components/bot/CubeBot'
import { ChatInput } from '../components/chat/ChatInput'
import { SettingsPanel } from '../components/layout/SettingsPanel'
import { useChatStore } from '../store/useChatStore'
import { useCubeBotChat } from '../hooks/useCubeBotChat'
import { unlockSpeech, isTTSSupported, stopSpeaking } from '../services/voiceService'

import { FrontierLayout } from '../components/frontier/FrontierLayout'

export function ChatPage() {
    const { 
        sessions, 
        currentSessionId, 
        isStreaming, 
        settings, 
        updateSettings, 
        setEyeTarget,
        activeSkin 
    } = useChatStore()
    const { send, stop } = useCubeBotChat()
    const [showVoiceToast, setShowVoiceToast] = useState(false)

    const currentSession = sessions[currentSessionId]
    const messages = currentSession?.messages || []

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

    // ── Voice toggle ──
    const handleVoiceToggle = () => {
        const next = !settings.voiceEnabled
        updateSettings({ voiceEnabled: next })

        if (next) {
            unlockSpeech()
        } else {
            stopSpeaking()
        }

        setShowVoiceToast(true)
        setTimeout(() => setShowVoiceToast(false), 1800)
    }

    if (activeSkin === 'frontier') {
        return <FrontierLayout />
    }

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

            {/* Top-right controls */}
            <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
                {/* Voice toggle */}
                {isTTSSupported() && (
                    <motion.button
                        onClick={handleVoiceToggle}
                        whileTap={{ scale: 0.88 }}
                        title={settings.voiceEnabled ? 'Mute voice' : 'Enable voice'}
                        className={`w-9 h-9 rounded-xl border shadow-sm flex items-center justify-center transition-all duration-200 ${settings.voiceEnabled
                                ? 'bg-green-50 border-green-200 text-green-500 hover:bg-green-100'
                                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300'
                            }`}
                    >
                        {settings.voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                    </motion.button>
                )}
                <SettingsPanel />
            </div>

            {/* Voice on/off toast */}
            <AnimatePresence>
                {showVoiceToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        className="fixed top-16 right-4 z-50 px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-medium shadow-lg"
                    >
                        {settings.voiceEnabled ? '🔊 Voice on' : '🔇 Voice off'}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <motion.div
                className="relative text-center mb-6"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h1 className="font-display font-bold text-2xl text-indigo-600 tracking-tight">Desktop CubeBot</h1>
                <p className="text-slate-400 text-xs">Your desk companion</p>
            </motion.div>

            {/* Computer Bot */}
            <motion.div
                className="w-full flex justify-center"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <ComputerBot messages={messages} isStreaming={isStreaming} />
            </motion.div>

            {/* Chat Input */}
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
