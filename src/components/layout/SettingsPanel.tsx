import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, X, Trash2, Key, Bot, Sliders } from 'lucide-react'
import { useChatStore } from '../../store/useChatStore'

const MODELS = [
    { value: 'moonshot-v1-8k', label: 'CubeBot v1 · 8K context' },
    { value: 'moonshot-v1-32k', label: 'CubeBot v1 · 32K context' },
    { value: 'moonshot-v1-128k', label: 'CubeBot v1 · 128K context' },
]

export function SettingsPanel() {
    const [open, setOpen] = useState(false)
    const { settings, updateSettings, clearHistory } = useChatStore()

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-200 transition-colors duration-200"
                title="Settings"
            >
                <Settings size={16} />
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                        />
                        <motion.div
                            className="fixed right-4 top-4 bottom-4 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden"
                            initial={{ x: '110%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '110%', opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Sliders size={15} className="text-indigo-500" />
                                    <span className="font-display font-semibold text-slate-700 text-sm">Settings</span>
                                </div>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors"
                                >
                                    <X size={13} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                                {/* API Key */}
                                <section>
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                                        <Key size={11} />
                                        Moonshot API Key
                                    </label>
                                    <input
                                        type="password"
                                        value={settings.apiKey}
                                        onChange={(e) => updateSettings({ apiKey: e.target.value })}
                                        placeholder="sk-..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1.5">
                                        Get yours at{' '}
                                        <a href="https://platform.moonshot.cn" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
                                            platform.moonshot.cn
                                        </a>
                                    </p>
                                </section>

                                {/* Model */}
                                <section>
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                                        <Bot size={11} />
                                        Model
                                    </label>
                                    <select
                                        value={settings.model}
                                        onChange={(e) => updateSettings({ model: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-300 transition-all appearance-none cursor-pointer"
                                    >
                                        {MODELS.map((m) => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                </section>

                                {/* System Prompt */}
                                <section>
                                    <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wide">
                                        Super Prompt
                                    </label>
                                    <textarea
                                        value={settings.systemPrompt}
                                        onChange={(e) => updateSettings({ systemPrompt: e.target.value })}
                                        rows={5}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-300 transition-all resize-none leading-relaxed"
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">Define CubeBot's personality.</p>
                                </section>

                                {/* Temperature */}
                                <section>
                                    <label className="text-xs font-semibold text-slate-500 mb-2 flex justify-between uppercase tracking-wide">
                                        <span>Temperature</span>
                                        <span className="text-indigo-500 font-mono normal-case">{settings.temperature.toFixed(1)}</span>
                                    </label>
                                    <input type="range" min={0} max={1} step={0.1} value={settings.temperature}
                                        onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
                                        className="w-full accent-indigo-500"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                                        <span>Precise</span><span>Creative</span>
                                    </div>
                                </section>

                                {/* Max Tokens */}
                                <section>
                                    <label className="text-xs font-semibold text-slate-500 mb-2 flex justify-between uppercase tracking-wide">
                                        <span>Max Tokens</span>
                                        <span className="text-indigo-500 font-mono normal-case">{settings.maxTokens}</span>
                                    </label>
                                    <input type="range" min={256} max={8192} step={256} value={settings.maxTokens}
                                        onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value) })}
                                        className="w-full accent-indigo-500"
                                    />
                                </section>
                            </div>

                            <div className="px-5 py-4 border-t border-slate-100 flex flex-col gap-2">
                                <button
                                    onClick={() => setOpen(false)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm"
                                >
                                    Save & Close
                                </button>
                                <button
                                    onClick={() => { if (confirm('Clear all chat history?')) clearHistory() }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 text-red-500 text-xs transition-colors"
                                >
                                    <Trash2 size={12} />
                                    Clear conversation
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
