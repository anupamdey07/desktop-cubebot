import { useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, Loader2, CheckCircle2, AlertCircle, Tag, Layout as LayoutIcon, RefreshCw, History, Plus, Star, Trash2, X } from 'lucide-react'
import { ComputerBot } from '../components/bot/CubeBot'
import { ChatInput } from '../components/chat/ChatInput'
import { SettingsPanel } from '../components/layout/SettingsPanel'
import { useChatStore } from '../store/useChatStore'
import { useCubeBotChat } from '../hooks/useCubeBotChat'
import { unlockSpeech, isTTSSupported, stopSpeaking } from '../services/voiceService'
import { FrontierLayout } from '../components/frontier/FrontierLayout'
import { syncSessionToKarakeep } from '../services/karakeepService'

export function ChatPage() {
    const { 
        sessions, 
        currentSessionId, 
        isStreaming, 
        settings, 
        updateSettings, 
        setEyeTarget,
        activeSkin,
        setSkin,
        createSession,
        switchSession,
        deleteSession,
        updateSession,
        clearHistory,
        setLatency,
        setBotStatus
    } = useChatStore()
    
    const { send, stop } = useCubeBotChat()
    const [showVoiceToast, setShowVoiceToast] = useState(false)
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)

    const currentSession = sessions[currentSessionId]
    const messages = currentSession?.messages || []

    const handleSync = async () => {
        if (!currentSession || syncStatus === 'syncing') return
        setSyncStatus('syncing')
        try {
            await syncSessionToKarakeep(currentSession)
            setSyncStatus('success')
            setTimeout(() => setSyncStatus('idle'), 3000)
        } catch (err) {
            setSyncStatus('error')
            setTimeout(() => setSyncStatus('idle'), 5000)
        }
    }

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

    const sessionList = Object.values(sessions).sort((a, b) => {
        if (a.isBookmarked && !b.isBookmarked) return -1
        if (!a.isBookmarked && b.isBookmarked) return 1
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

    if (activeSkin === 'frontier') {
        return <FrontierLayout />
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-start pt-8 pb-6 px-4 overflow-hidden">
            {/* History Toggle Button (Left) */}
            <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
                <motion.button
                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                    whileTap={{ scale: 0.88 }}
                    title="Conversation History"
                    className={`w-9 h-9 rounded-xl border shadow-sm flex items-center justify-center transition-all duration-200 ${isHistoryOpen
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-500 hover:border-indigo-200'
                    }`}
                >
                    <History size={16} />
                </motion.button>
                
                <motion.button
                    onClick={() => createSession()}
                    whileTap={{ scale: 0.88 }}
                    title="New Chat"
                    className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-indigo-500 hover:border-indigo-200 shadow-sm flex items-center justify-center transition-all"
                >
                    <Plus size={16} />
                </motion.button>
            </div>
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

                {/* Web UI Toggle */}
                <motion.button
                    onClick={() => setSkin('frontier')}
                    whileTap={{ scale: 0.88 }}
                    title="Switch to Web UI"
                    className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-indigo-500 hover:border-indigo-200 shadow-sm flex items-center justify-center transition-all"
                >
                    <LayoutIcon size={15} />
                </motion.button>

                {/* Karakeep Sync */}
                <motion.button 
                    onClick={handleSync}
                    disabled={syncStatus === 'syncing'}
                    whileTap={{ scale: 0.88 }}
                    title="Sync to Karakeep"
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all shadow-sm ${
                        syncStatus === 'success' 
                        ? 'bg-green-50 border-green-200 text-green-600' 
                        : syncStatus === 'error'
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-500 hover:border-indigo-200'
                    }`}
                >
                    {syncStatus === 'syncing' ? (
                        <Loader2 size={12} className="animate-spin" />
                    ) : syncStatus === 'success' ? (
                        <CheckCircle2 size={12} />
                    ) : syncStatus === 'error' ? (
                        <AlertCircle size={12} />
                    ) : (
                        <Tag size={12} />
                    )}
                </motion.button>
                
                {/* Repair Button (in case of stuck state) */}
                <motion.button 
                    onClick={() => useChatStore.getState().setStreaming(false)}
                    whileTap={{ scale: 0.88 }}
                    title="Reset system state"
                    className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-300 hover:text-indigo-400 shadow-sm flex items-center justify-center transition-all"
                >
                    <RefreshCw size={14} />
                </motion.button>
                
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
                    <ChatInput 
                        onSend={(txt) => {
                            const { isStreaming: liveStrm } = useChatStore.getState()
                            if (!liveStrm) send(txt)
                        }} 
                        onStop={stop} 
                        isStreaming={isStreaming} 
                    />
                </div>
            </motion.div>

            {/* History Sidebar Drawer */}
            <AnimatePresence>
                {isHistoryOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsHistoryOpen(false)}
                            className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-40"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-slate-200 shadow-2xl z-50 flex flex-col overflow-hidden"
                        >
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h3 className="font-display font-bold text-slate-700 text-sm flex items-center gap-2">
                                    <History size={14} className="text-indigo-500" />
                                    Past Threads
                                </h3>
                                <button onClick={() => setIsHistoryOpen(false)} className="p-1 hover:bg-slate-200 rounded-md text-slate-400">
                                    <X size={14} />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                {sessionList.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => { switchSession(s.id); setIsHistoryOpen(false); }}
                                        className={`group relative flex items-center gap-2 w-full p-3 rounded-xl transition-all text-left ${
                                            s.id === currentSessionId 
                                            ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100' 
                                            : 'text-slate-500 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex-1 truncate">
                                            <p className={`text-xs ${s.id === currentSessionId ? 'font-bold' : 'font-medium'}`}>
                                                {s.title}
                                            </p>
                                            <p className="text-[9px] opacity-60 mt-0.5 font-mono">
                                                {new Date(s.updatedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-1">
                                            <span 
                                                onClick={(e) => { e.stopPropagation(); updateSession(s.id, { isBookmarked: !s.isBookmarked }) }}
                                                className={`p-1 rounded-md hover:bg-white transition-colors ${s.isBookmarked ? 'text-amber-400' : 'text-slate-300'}`}
                                            >
                                                <Star size={11} fill={s.isBookmarked ? "currentColor" : "none"} />
                                            </span>
                                            <span 
                                                onClick={(e) => { e.stopPropagation(); if(confirm('Delete this chat?')) deleteSession(s.id) }}
                                                className="p-1 rounded-md hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={11} />
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            
                            <div className="p-4 border-t border-slate-100 text-center">
                                <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">Memory Bank V2.0</p>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
