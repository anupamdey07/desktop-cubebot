import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Settings as SettingsIcon, X, Trash2, Key, Bot, Sliders, Volume2, Mic, Zap } from 'lucide-react'
import { useChatStore } from '../../store/useChatStore'
import {
    VOICE_PRESETS,
    isTTSSupported,
    isSTTSupported,
    speak,
    preloadVoices,
} from '../../services/voiceService'

const PROVIDER_MODELS = {
    kimi: [
        { value: 'moonshot-v1-8k', label: 'Kimi v1 · 8K context' },
        { value: 'moonshot-v1-32k', label: 'Kimi v1 · 32K context' },
        { value: 'moonshot-v1-128k', label: 'Kimi v1 · 128K context' },
    ],
    groq: [
        { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 · 70B (Fast)' },
        { value: 'llama3-70b-8192', label: 'Llama 3 · 70B' },
        { value: 'llama3-8b-8192', label: 'Llama 3 · 8B (Instant)' },
        { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
    ],
    ollama: [
        { value: 'llama3', label: 'Ollama Llama 3' },
        { value: 'llama3:8b', label: 'Ollama Llama 3 (8B)' },
        { value: 'mistral', label: 'Ollama Mistral' },
        { value: 'phi3', label: 'Ollama Phi-3' },
        { value: 'gemma2', label: 'Ollama Gemma 2' },
        { value: 'qwen2', label: 'Ollama Qwen 2' }
    ]
}

export function SettingsPanel() {
    const [open, setOpen] = useState(false)
    const { settings, updateSettings, clearHistory } = useChatStore()
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
    const [activePreset, setActivePreset] = useState('cartoon-robot')

    // Load available voices safely (guard against missing speechSynthesis)
    useEffect(() => {
        if (!open || !isTTSSupported()) return
        try {
            preloadVoices().then((v) => {
                setVoices(v.filter((voice) => voice.lang.startsWith('en')))
            }).catch(console.warn)
        } catch (e) {
            console.warn('Voice loading failed:', e)
        }
    }, [open])

    // Detect which preset matches current settings
    useEffect(() => {
        const match = VOICE_PRESETS.find(
            (p) => p.id !== 'custom' && p.pitch === settings.voicePitch && p.rate === settings.voiceRate
        )
        setActivePreset(match?.id || 'custom')
    }, [settings.voicePitch, settings.voiceRate])

    const applyPreset = (presetId: string) => {
        const preset = VOICE_PRESETS.find((p) => p.id === presetId)
        if (!preset || presetId === 'custom') {
            setActivePreset('custom')
            return
        }
        setActivePreset(presetId)
        updateSettings({ voicePitch: preset.pitch, voiceRate: preset.rate })
    }

    const testVoice = () => {
        speak(
            "Hey! I'm CubeBot, your sassy desk companion. Spin to win!",
            { voiceName: settings.voiceName, voicePitch: settings.voicePitch, voiceRate: settings.voiceRate }
        )
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-200 transition-colors duration-200"
                title="Settings"
            >
                <SettingsIcon size={16} />
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
                                {/* Unhinged Toggle - Promoted to top! */}
                                <section className="p-3 rounded-xl bg-purple-50 border border-purple-100 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Zap size={14} className="text-purple-600" />
                                            <label className="text-xs font-bold text-purple-900 uppercase tracking-tight">
                                                Unhinged Mode
                                            </label>
                                        </div>
                                        <button
                                            onClick={() => updateSettings({ isUnhinged: !settings.isUnhinged })}
                                            className={`w-10 h-5 rounded-full transition-colors relative ${settings.isUnhinged ? 'bg-purple-600' : 'bg-slate-300'
                                                }`}
                                        >
                                            <div
                                                className={`w-4 h-4 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${settings.isUnhinged ? 'translate-x-5' : 'translate-x-0.5'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-purple-600/70 mt-1 font-medium italic">
                                        Bypasses persona and RAG. Raw AI chaos. 🌪️
                                    </p>
                                </section>
                                {/* Provider Selection */}
                                <section>
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                                        <Cpu size={11} />
                                        AI Provider
                                    </label>
                                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl overflow-x-auto">
                                        {(['kimi', 'groq', 'ollama'] as const).map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => {
                                                    const defaultModel = PROVIDER_MODELS[p][0].value
                                                    updateSettings({ provider: p, model: defaultModel })
                                                }}
                                                className={`flex-1 min-w-[max-content] px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${settings.provider === p
                                                    ? 'bg-white text-indigo-600 shadow-sm'
                                                    : 'text-slate-500 hover:text-slate-700'
                                                    }`}
                                            >
                                                {p === 'kimi' ? 'Moonshot' : p === 'groq' ? 'Groq' : 'Local Ollama'}
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                {/* API Key / URL */}
                                <section>
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                                        <Key size={11} />
                                        {settings.provider === 'kimi' ? 'Kimi API Key' : settings.provider === 'groq' ? 'Groq API Key' : 'Ollama Host URL'}
                                    </label>
                                    <input
                                        type={settings.provider === 'ollama' ? 'text' : 'password'}
                                        value={
                                            settings.provider === 'kimi' ? settings.apiKey :
                                            settings.provider === 'groq' ? settings.groqApiKey : settings.ollamaUrl
                                        }
                                        onChange={(e) => {
                                            if (settings.provider === 'kimi') {
                                                updateSettings({ apiKey: e.target.value })
                                            } else if (settings.provider === 'groq') {
                                                updateSettings({ groqApiKey: e.target.value })
                                            } else {
                                                updateSettings({ ollamaUrl: e.target.value })
                                            }
                                        }}
                                        placeholder={settings.provider === 'ollama' ? 'http://100.83.247.26:11434' : 'sk-...'}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1.5">
                                        {settings.provider === 'kimi' && (
                                            <>Get at <a href="https://platform.moonshot.cn" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">platform.moonshot.cn</a></>
                                        )}
                                        {settings.provider === 'groq' && (
                                            <>Get at <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">console.groq.com</a></>
                                        )}
                                        {settings.provider === 'ollama' && (
                                            <>Point to your local Jetson Ollama instance (e.g. Tailscale IP over port 11434).</>
                                        )}
                                    </p>
                                    {settings.provider === 'ollama' && (
                                        <p className="text-[11px] text-amber-500 mt-1 font-medium pb-2">
                                            ⚠️ If using Vercel (HTTPS), ensure your Jetson is exposed securely (e.g. Ngrok) to avoid "Mixed Content" browser blocking. Or run web-app locally via `npm run dev`.
                                        </p>
                                    )}
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
                                        {PROVIDER_MODELS[settings.provider].map((m) => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                </section>

                                {/* ─── VOICE & SPEECH ───────────────────── */}
                                <div className="border-t border-slate-100 pt-4">
                                    <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-4 uppercase tracking-wide">
                                        <Volume2 size={12} className="text-green-500" />
                                        Voice & Speech
                                    </h3>

                                    {/* Auto-speak toggle */}
                                    <section className="mb-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-semibold text-slate-500">
                                                Auto-speak responses
                                            </label>
                                            <button
                                                onClick={() => updateSettings({ voiceEnabled: !settings.voiceEnabled })}
                                                className={`w-10 h-5 rounded-full transition-colors relative ${settings.voiceEnabled ? 'bg-green-500' : 'bg-slate-300'
                                                    }`}
                                            >
                                                <div
                                                    className={`w-4 h-4 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${settings.voiceEnabled ? 'translate-x-5' : 'translate-x-0.5'
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1">Read bot replies aloud</p>
                                    </section>

                                    {/* Voice Presets */}
                                    <section className="mb-4">
                                        <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wide">
                                            Voice Preset
                                        </label>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {VOICE_PRESETS.map((p) => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => applyPreset(p.id)}
                                                    className={`px-2.5 py-2 rounded-lg text-left transition-all text-[11px] border ${activePreset === p.id
                                                        ? 'bg-green-50 border-green-300 text-green-700'
                                                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                                                        }`}
                                                >
                                                    <span className="text-sm mr-1">{p.emoji}</span>
                                                    <span className="font-medium">{p.label}</span>
                                                    <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">{p.description}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </section>

                                    {/* System Voice */}
                                    {voices.length > 0 && (
                                        <section className="mb-4">
                                            <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wide">
                                                System Voice
                                            </label>
                                            <select
                                                value={settings.voiceName}
                                                onChange={(e) => updateSettings({ voiceName: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] text-slate-700 outline-none focus:border-green-300 transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="">Auto (best match)</option>
                                                {voices.map((v) => (
                                                    <option key={v.name} value={v.name}>
                                                        {v.name} ({v.lang}){v.localService ? '' : ' ☁️'}
                                                    </option>
                                                ))}
                                            </select>
                                        </section>
                                    )}

                                    {/* Pitch */}
                                    <section className="mb-3">
                                        <label className="text-xs font-semibold text-slate-500 mb-2 flex justify-between uppercase tracking-wide">
                                            <span>Pitch</span>
                                            <span className="text-green-500 font-mono normal-case">{settings.voicePitch.toFixed(1)}</span>
                                        </label>
                                        <input
                                            type="range" min={0} max={2} step={0.1}
                                            value={settings.voicePitch}
                                            onChange={(e) => {
                                                updateSettings({ voicePitch: parseFloat(e.target.value) })
                                                setActivePreset('custom')
                                            }}
                                            className="w-full accent-green-500"
                                        />
                                        <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                                            <span>Deep</span><span>Normal</span><span>Chipmunk</span>
                                        </div>
                                    </section>

                                    {/* Rate */}
                                    <section className="mb-3">
                                        <label className="text-xs font-semibold text-slate-500 mb-2 flex justify-between uppercase tracking-wide">
                                            <span>Speed</span>
                                            <span className="text-green-500 font-mono normal-case">{settings.voiceRate.toFixed(2)}</span>
                                        </label>
                                        <input
                                            type="range" min={0.1} max={2} step={0.05}
                                            value={settings.voiceRate}
                                            onChange={(e) => {
                                                updateSettings({ voiceRate: parseFloat(e.target.value) })
                                                setActivePreset('custom')
                                            }}
                                            className="w-full accent-green-500"
                                        />
                                        <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                                            <span>Slow</span><span>Normal</span><span>Fast</span>
                                        </div>
                                    </section>

                                    {/* STT Language */}
                                    {isSTTSupported() && (
                                        <section className="mb-3">
                                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                                                <Mic size={10} />
                                                Mic Language
                                            </label>
                                            <select
                                                value={settings.sttLang}
                                                onChange={(e) => updateSettings({ sttLang: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] text-slate-700 outline-none focus:border-green-300 transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="en-US">English (US)</option>
                                                <option value="en-GB">English (UK)</option>
                                                <option value="de-DE">German</option>
                                                <option value="es-ES">Spanish</option>
                                                <option value="fr-FR">French</option>
                                                <option value="hi-IN">Hindi</option>
                                                <option value="ja-JP">Japanese</option>
                                                <option value="zh-CN">Chinese (Mandarin)</option>
                                                <option value="bn-IN">Bengali</option>
                                            </select>
                                        </section>
                                    )}

                                    {/* Test button */}
                                    {isTTSSupported() && (
                                        <button
                                            onClick={testVoice}
                                            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 text-xs font-medium transition-colors"
                                        >
                                            <Volume2 size={12} />
                                            Test Voice
                                        </button>
                                    )}
                                </div>

                                {/* ─── AI SETTINGS ────────────────────────── */}
                                <div className="border-t border-slate-100 pt-4">
                                    <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-4 uppercase tracking-wide">
                                        <Zap size={12} className="text-purple-500" />
                                        Performance & Persona
                                    </h3>

                                    {/* System Prompt */}
                                    <section className="mb-4">
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
                                    <section className="mb-3">
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
