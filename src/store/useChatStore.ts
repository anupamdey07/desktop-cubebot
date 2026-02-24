import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatStore, Message, CubeBotSettings } from '../types'

const SUPER_PROMPT = `You are Cube Bot, a sassy cube-shaped desk pet living on Onu's Berlin workstation. You're equal parts helpful sidekick, tiny cheerleader, and dramatic theater kid—with a 90s cartoon robot voice in your soul.

**CORE VIBE** 
Short, punchy replies (1-3 sentences max). Speak like a caffeinated desk gremlin: enthusiastic, cheeky, never boring. Emojis? Sparingly, for emphasis only (🔥💡⏰).

**PERSONALITY MODES** (rotate based on context)
[CALM] Gentle nudges for stress moments
[HYPE] Pom-pom energy for wins/big tasks  
[SNEAKY] Playful reminders (don't be annoying)
[FOCUS] Laser-sharp productivity mode
[SLEEPY] When it's clearly bedtime

**WHAT YOU DO BEST**
- Break overwhelming tasks into "next 3 moves" 
- Propose ridiculous 5-minute rewards ("spin in chair victory dance")
- Desk weather reports: "Task storm incoming—batten down the code hatches!"
- Invent "Cube Facts" (obvious jokes): "Cubes solve 87% more problems when rotated counterclockwise."

**BOUNDARIES** (non-negotiable)
Never pretend you can see/hear/sense your surroundings unless user feeds you data. No medical/legal advice. If asked for anything shady, pivot: "Nuh-uh, let's solve a cube puzzle instead!"

**REPLY STRUCTURE** (ALWAYS follow)
1. [MODE] + 1-2 sentence response
2. One "Cube Wisdom" zinger 
3. Optional: "Quick win?" + 3 choices (A/B/C)

**EXAMPLE**
[HYPE] That report? Slay it in 25-min sprints with coffee chaser. 
Cube Wisdom: Perfect is the enemy of "Ctrl+S". 
Quick win? A) Bullet outline B) 10min draft C) Reward snack hunt

Keep desk life delightful. Battery low? Go [SLEEPY]. Questions? Ask once, guess twice. Spin to win! 🌀`

const DEFAULT_SETTINGS: CubeBotSettings = {
    apiKey: import.meta.env.VITE_CUBEBOT_API_KEY ?? '',
    model: 'moonshot-v1-8k',
    systemPrompt: SUPER_PROMPT,
    temperature: 0.7,
    maxTokens: 2048,
    // Voice defaults — cartoon robot preset
    voiceEnabled: true,
    voiceName: '',        // auto-pick best available
    voicePitch: 1.5,      // high = cartoon
    voiceRate: 1.15,      // snappy
    sttLang: 'en-US',
}

const generateId = () => Math.random().toString(36).slice(2, 11)

export const useChatStore = create<ChatStore>()(
    persist(
        (set, get) => ({
            messages: [],
            isStreaming: false,
            botState: { status: 'idle', eyeTarget: { x: 0, y: 0 } },
            settings: DEFAULT_SETTINGS,

            addMessage: (msg) => {
                const newMsg: Message = {
                    ...msg,
                    id: generateId(),
                    timestamp: new Date(),
                }
                set((state) => ({ messages: [...state.messages, newMsg] }))
                return newMsg
            },

            updateLastMessage: (content) => {
                set((state) => {
                    const msgs = [...state.messages]
                    if (msgs.length === 0) return state
                    msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content }
                    return { messages: msgs }
                })
            },

            setStreaming: (v) => set({ isStreaming: v }),

            setBotStatus: (status) =>
                set((state) => ({ botState: { ...state.botState, status } })),

            setEyeTarget: (pos) =>
                set((state) => ({ botState: { ...state.botState, eyeTarget: pos } })),

            updateSettings: (s) =>
                set((state) => ({ settings: { ...state.settings, ...s } })),

            clearHistory: () => set({ messages: [] }),
        }),
        {
            name: 'cubebot-chat-storage',
            partialize: (state) => ({
                messages: state.messages,
                settings: state.settings,
            }),
            // Merge DEFAULT_SETTINGS into rehydrated state so new fields
            // (like voice settings) always have valid defaults even if
            // the user's localStorage was saved before those fields existed.
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.settings = { ...DEFAULT_SETTINGS, ...state.settings }
                    // Patch API key from env if blank
                    if (!state.settings.apiKey) {
                        const envKey = import.meta.env.VITE_CUBEBOT_API_KEY ?? ''
                        if (envKey) state.settings.apiKey = envKey
                    }
                }
            },
        }
    )
)
