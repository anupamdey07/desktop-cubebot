import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Plus, Bookmark, Tag, Settings, Terminal, Send, Search, 
    PanelLeftClose, PanelLeftOpen, Trash2, Star, CheckCircle2, 
    Loader2, AlertCircle, Edit2, RefreshCw, ArrowDown
} from 'lucide-react'
import { useChatStore } from '../../store/useChatStore'
import { ChatInput } from '../chat/ChatInput'
import { SettingsPanel } from '../layout/SettingsPanel'
import { useCubeBotChat } from '../../hooks/useCubeBotChat'
import { syncSessionToKarakeep } from '../../services/karakeepService'

export function FrontierLayout() {
    const { 
        sessions, 
        currentSessionId, 
        createSession, 
        switchSession, 
        deleteSession,
        updateSession,
        isStreaming,
        setSkin,
        settings,
        updateSettings
    } = useChatStore()
    
    const { send, stop } = useCubeBotChat()
    
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)
    const [syncStatus, setSyncStatus] = React.useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
    const [showScrollDown, setShowScrollDown] = React.useState(false)
    const scrollAreaRef = React.useRef<HTMLDivElement>(null)

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
        setShowScrollDown(scrollHeight - scrollTop - clientHeight > 300)
    }

    const scrollToBottom = () => {
        scrollAreaRef.current?.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' })
    }

    const currentSession = sessions[currentSessionId]
    const sessionList = Object.values(sessions).sort((a, b) => {
        // Bookmarked sessions first, then by date
        if (a.isBookmarked && !b.isBookmarked) return -1
        if (!a.isBookmarked && b.isBookmarked) return 1
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

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

    return (
        <div className="flex h-screen w-full bg-[#fcfcfc] text-slate-800 font-sans overflow-hidden">
            {/* Sidebar */}
            <motion.aside 
                initial={false}
                animate={{ width: isSidebarOpen ? 260 : 0, opacity: isSidebarOpen ? 1 : 0 }}
                className="bg-[#f3f3f3] border-r border-slate-200 flex flex-col h-full relative"
            >
                <div className="p-4 flex flex-col h-full overflow-hidden w-[260px]">
                    <button 
                        onClick={() => createSession()}
                        className="flex items-center gap-2 w-full p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-sm font-semibold shadow-sm mb-6 active:scale-95"
                    >
                        <Plus size={16} className="text-indigo-600" />
                        New Chat
                    </button>

                    <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        <div className="px-2 py-2 text-[10px] uppercase tracking-widest font-bold text-slate-400">History</div>
                        {sessionList.map(s => (
                            <div 
                                key={s.id}
                                className={`group relative flex items-center gap-1 w-full rounded-lg transition-all ${
                                    s.id === currentSessionId ? 'bg-white shadow-sm ring-1 ring-slate-200' : 'hover:bg-slate-200/50'
                                }`}
                            >
                                <button
                                    onClick={() => switchSession(s.id)}
                                    className={`flex-1 text-left p-2.5 text-sm truncate rounded-lg ${
                                        s.id === currentSessionId ? 'font-bold text-indigo-700' : 'text-slate-600'
                                    }`}
                                >
                                    {s.title}
                                </button>
                                
                                <div className={`flex items-center gap-1 pr-2 opacity-0 group-hover:opacity-100 transition-opacity ${s.id === currentSessionId ? 'opacity-100' : ''}`}>
                                    <button 
                                        onClick={() => updateSession(s.id, { isBookmarked: !s.isBookmarked })}
                                        className={`p-1 rounded hover:bg-slate-200 transition-colors ${s.isBookmarked ? 'text-amber-500 opacity-100' : 'text-slate-400'}`}
                                    >
                                        <Star size={12} fill={s.isBookmarked ? "currentColor" : "none"} />
                                    </button>
                                    <button 
                                        onClick={() => { if(confirm('Delete this chat?')) deleteSession(s.id) }}
                                        className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto border-t border-slate-200 pt-4 space-y-1">
                        <button 
                            onClick={() => setSkin('cubebot')}
                            className="flex items-center gap-2.5 w-full p-2.5 rounded-xl hover:bg-slate-200 text-sm text-indigo-600 font-bold transition-colors"
                        >
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <Terminal size={16} />
                            </div>
                            Cubebot UI
                        </button>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative h-full bg-white">
                {/* Top Bar / Model Selector */}
                <header className="h-14 border-b border-slate-100 bg-white/80 backdrop-blur-md flex items-center px-4 justify-between shrink-0 z-10">
                    <div className="flex items-center gap-3">
                        {!isSidebarOpen && (
                            <button 
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
                            >
                                <PanelLeftOpen size={18} />
                            </button>
                        )}
                        {isSidebarOpen && (
                             <button 
                                onClick={() => setIsSidebarOpen(false)}
                                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
                            >
                                <PanelLeftClose size={18} />
                            </button>
                        )}
                        
                        {/* Model Selector Bar */}
                        <div className="flex items-center bg-slate-100/80 rounded-full p-1 border border-slate-200/50">
                            {['kimi', 'groq', 'ollama-local'].map(m => (
                                <button
                                    key={m}
                                    onClick={() => updateSettings({ 
                                        model: m, 
                                        provider: m === 'ollama-local' ? 'ollama' : (m as any),
                                        temperature: m === 'kimi' ? 1.0 : settings.temperature
                                    })}
                                    className={`px-4 py-1 rounded-full text-[11px] font-black tracking-tight transition-all duration-200 ${
                                        settings.model === m 
                                        ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    {m === 'ollama-local' ? 'OLLAMA' : m.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Repair Button (in case of stuck state) */}
                        <button 
                            onClick={() => useChatStore.getState().setStreaming(false)}
                            title="Reset system state"
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-300 hover:text-indigo-400 transition-colors"
                        >
                            <RefreshCw size={14} />
                        </button>

                        <SettingsPanel />

                        {/* Sync Button */}
                        <button 
                            onClick={handleSync}
                            disabled={syncStatus === 'syncing'}
                            className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                                syncStatus === 'success' 
                                ? 'bg-green-50 border-green-200 text-green-600' 
                                : syncStatus === 'error'
                                ? 'bg-red-50 border-red-200 text-red-600'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-white'
                            }`}
                        >
                            {syncStatus === 'syncing' ? (
                                <Loader2 size={12} className="animate-spin" />
                            ) : syncStatus === 'success' ? (
                                <CheckCircle2 size={12} />
                            ) : syncStatus === 'error' ? (
                                <AlertCircle size={12} />
                            ) : (
                                <Tag size={12} className="opacity-50 group-hover:opacity-100" />
                            )}
                            {syncStatus === 'syncing' ? 'SYNCING...' : syncStatus === 'success' ? 'SYNCED' : syncStatus === 'error' ? 'FAILED' : 'SYNC TO KARAKEEP'}
                        </button>
                        
                        <div className="flex items-center gap-2 bg-slate-50 pl-1 pr-3 py-1 rounded-full border border-slate-200/50">
                            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">
                                AD
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">PRO</span>
                        </div>
                    </div>
                </header>

                {/* Chat Area */}
                <div 
                    ref={scrollAreaRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar scroll-smooth"
                >
                    <div className="max-w-3xl mx-auto space-y-8 pb-20">
                        {(!currentSession || currentSession.messages.filter(m => m.role !== 'system').length === 0) && (
                            <div className="h-full flex flex-col items-center justify-center pt-20 text-center space-y-4">
                                <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center mb-2">
                                    <Terminal size={32} className="text-indigo-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Frontier v6.0</h3>
                                <p className="text-slate-400 text-sm max-w-sm">How can I help with your robotics or 3D printing project today?</p>
                            </div>
                        )}
                        
                        {currentSession?.messages.filter(m => m.role !== 'system').map(m => (
                            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 shadow-sm relative ${
                                    m.role === 'user' 
                                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                                    : 'bg-white text-slate-800 border border-slate-200/50 rounded-tl-none font-sans leading-relaxed'
                                }`}>
                                    <div className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-50">
                                        {m.role === 'user' ? 'YOU' : 'CUBEBOT'}
                                    </div>
                                    <div className="text-[14px] prose prose-slate max-w-none">
                                        {m.content || (
                                            <div className="flex gap-1.5 py-2">
                                                <div className="w-1.5 h-1.5 bg-indigo-400/40 rounded-full animate-bounce [animation-duration:0.8s]" />
                                                <div className="w-1.5 h-1.5 bg-indigo-400/70 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]" />
                                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]" />
                                            </div>
                                        )}
                                    </div>
                                    <div className={`text-[9px] mt-3 font-mono opacity-40 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', hour12: true, minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Floating Scroll Down Button */}
                    <AnimatePresence>
                        {showScrollDown && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                onClick={scrollToBottom}
                                className="fixed bottom-32 right-8 w-10 h-10 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-colors z-20"
                            >
                                <ArrowDown size={18} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-slate-100 bg-white/50 backdrop-blur-md shrink-0">
                    <div className="max-w-3xl mx-auto relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur opacity-0 group-focus-within:opacity-10 transition duration-500" />
                        <div className="relative bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden focus-within:border-indigo-400/50 transition-colors">
                            <ChatInput 
                                onSend={(txt) => {
                                    const { isStreaming: liveStrm } = useChatStore.getState()
                                    if (!liveStrm) send(txt)
                                }} 
                                onStop={stop} 
                                isStreaming={isStreaming} 
                            />
                        </div>
                    </div>
                    <div className="text-[9px] text-center text-slate-400 mt-4 font-mono tracking-tighter uppercase">
                        Jetson Orin Nano • Faster-Whisper • 100 TOPS Class Edge AI
                    </div>
                </div>
            </main>
        </div>
    )
}

