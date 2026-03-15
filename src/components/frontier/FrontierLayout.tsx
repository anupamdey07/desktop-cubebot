import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Bookmark, Tag, Settings, Terminal, Send, Search, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useChatStore } from '../../store/useChatStore'
import { ChatInput } from '../chat/ChatInput'
import { useCubeBotChat } from '../../hooks/useCubeBotChat'

export function FrontierLayout() {
    const { 
        sessions, 
        currentSessionId, 
        createSession, 
        switchSession, 
        activeSkin, 
        setSkin,
        settings,
        updateSettings
    } = useChatStore()
    const { send, stop } = useCubeBotChat()
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)

    const currentSession = sessions[currentSessionId]
    const sessionList = Object.values(sessions).sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )

    return (
        <div className="flex h-screen w-full bg-[#f9f9f9] text-slate-800 font-sans overflow-hidden">
            {/* Sidebar */}
            <motion.aside 
                initial={false}
                animate={{ width: isSidebarOpen ? 260 : 0, opacity: isSidebarOpen ? 1 : 0 }}
                className="bg-[#f0f0f0] border-r border-slate-200 flex flex-col h-full relative"
            >
                <div className="p-4 flex flex-col h-full overflow-hidden w-[260px]">
                    <button 
                        onClick={() => createSession()}
                        className="flex items-center gap-2 w-full p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm mb-4"
                    >
                        <Plus size={16} />
                        New Chat
                    </button>

                    <div className="flex-1 overflow-y-auto space-y-1">
                        <div className="px-2 py-1 text-[10px] uppercase tracking-wider font-bold text-slate-400">Recent Chats</div>
                        {sessionList.map(s => (
                            <button
                                key={s.id}
                                onClick={() => switchSession(s.id)}
                                className={`w-full text-left p-2 rounded-lg text-sm truncate transition-colors ${
                                    s.id === currentSessionId ? 'bg-slate-200 font-medium' : 'hover:bg-slate-100'
                                }`}
                            >
                                {s.title}
                            </button>
                        ))}
                    </div>

                    <div className="mt-auto border-t border-slate-200 pt-4 space-y-1">
                        <button className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-slate-100 text-sm">
                            <Bookmark size={16} className="text-slate-400" />
                            Bookmarks
                        </button>
                        <button 
                            onClick={() => setSkin('cubebot')}
                            className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-slate-100 text-sm text-indigo-600 font-medium"
                        >
                            <Terminal size={16} />
                            Classic Mode
                        </button>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative h-full">
                {/* Top Bar / Model Selector */}
                <header className="h-14 border-b border-slate-200 bg-white flex items-center px-4 justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
                        >
                            {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                        </button>
                        
                        {/* Model Selector Bar */}
                        <div className="flex items-center bg-slate-100 rounded-full p-1 ml-2">
                            {['kimi', 'groq', 'ollama-local'].map(m => (
                                <button
                                    key={m}
                                    onClick={() => updateSettings({ model: m, provider: m === 'ollama-local' ? 'ollama' : (m as any) })}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                        settings.model === m 
                                        ? 'bg-white text-indigo-600 shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    {m === 'ollama-local' ? 'OLLAMA' : m.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="text-xs font-bold text-slate-400 hover:text-indigo-500 flex items-center gap-1">
                            <Tag size={12} />
                            SYNC TO KARAKEEP
                        </button>
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs ring-1 ring-indigo-200">
                            AD
                        </div>
                    </div>
                </header>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                    <div className="max-w-3xl mx-auto space-y-6">
                        {currentSession?.messages.filter(m => m.role !== 'system').map(m => (
                            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                                    m.role === 'user' 
                                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                                }`}>
                                    <div className="text-sm prose prose-sm max-w-none">
                                        {m.content || (
                                            <div className="flex gap-1 py-1">
                                                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                                                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                                                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                                            </div>
                                        )}
                                    </div>
                                    <div className={`text-[10px] mt-2 opacity-50 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-200 bg-white shrink-0">
                    <div className="max-w-3xl mx-auto relative">
                        <ChatInput onSend={send} onStop={stop} isStreaming={true} />
                    </div>
                    <div className="text-[10px] text-center text-slate-400 mt-2">
                        CubeBot v6.0 | Frontier Skin | Powered by Jetson Orin Nano
                    </div>
                </div>
            </main>
        </div>
    )
}
