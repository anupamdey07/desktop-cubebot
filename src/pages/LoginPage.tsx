import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import { Bot, Lock, Code, ChevronRight } from 'lucide-react'

export function LoginPage() {
    const [email, setEmail] = useState('')
    const [pin, setPin] = useState('')
    const [error, setError] = useState(false)
    const login = useAuthStore(state => state.login)
    const navigate = useNavigate()

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        setError(false)
        if (login(email, pin)) {
            navigate('/')
        } else {
            setError(true)
            setPin('')
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-slate-100 p-8 overflow-hidden relative"
            >
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-50 rounded-tr-full -z-10" />

                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-4 relative">
                        <Bot size={32} className="text-white relative z-10" />
                        <div className="absolute bottom-2 right-2 w-2 h-2 bg-green-400 rounded-full border-2 border-indigo-600 animate-pulse" />
                    </div>
                    <h1 className="text-2xl font-bold font-display text-slate-800 tracking-tight">CubeBot v5</h1>
                    <p className="text-xs text-slate-500 font-medium mt-1">Secure Multi-Brain Gateway</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                            Email
                        </label>
                        <div className="relative">
                            <Code size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl pl-9 pr-4 py-3 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all font-medium"
                                placeholder="operator@jetson.local"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                            4-Digit PIN
                        </label>
                        <div className="relative">
                            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="password"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={4}
                                value={pin}
                                onChange={e => setPin(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-2xl tracking-[0.5em] font-mono rounded-xl pl-9 pr-4 py-2 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
                                placeholder="••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.p 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-xs text-red-500 font-medium text-center bg-red-50 py-2 rounded-lg"
                        >
                            Access Denied. Invalid credentials.
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-3 mt-4 flex items-center justify-center gap-2 group transition-all"
                    >
                        Authenticate
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>
            </motion.div>
        </div>
    )
}
