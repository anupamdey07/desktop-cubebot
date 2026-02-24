// ─── Voice Service: STT + TTS via Web Speech API ─────────────────────────────
// Ref: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API

import type { CubeBotSettings } from '../types'

// ─── Voice Presets ───────────────────────────────────────────────────────────

export interface VoicePreset {
    id: string
    label: string
    emoji: string
    pitch: number
    rate: number
    description: string
}

export const VOICE_PRESETS: VoicePreset[] = [
    {
        id: 'cartoon-robot',
        label: 'Cartoon Robot',
        emoji: '🤖',
        pitch: 1.5,
        rate: 1.15,
        description: 'High-pitched, snappy desk gremlin',
    },
    {
        id: 'chipmunk',
        label: 'Chipmunk',
        emoji: '🐿️',
        pitch: 2.0,
        rate: 1.4,
        description: 'Tiny, fast, and squeaky',
    },
    {
        id: 'deep-bot',
        label: 'Deep Bot',
        emoji: '🔊',
        pitch: 0.6,
        rate: 0.9,
        description: 'Low rumble, authoritative AI',
    },
    {
        id: 'narrator',
        label: 'Narrator',
        emoji: '📖',
        pitch: 1.0,
        rate: 0.95,
        description: 'Calm, natural storyteller',
    },
    {
        id: 'hyper',
        label: 'Hyper Mode',
        emoji: '⚡',
        pitch: 1.3,
        rate: 1.6,
        description: 'Caffeinated speedrun energy',
    },
    {
        id: 'sleepy',
        label: 'Sleepy Bot',
        emoji: '😴',
        pitch: 0.8,
        rate: 0.7,
        description: 'Drowsy and slow wind-down',
    },
    {
        id: 'custom',
        label: 'Custom',
        emoji: '🎛️',
        pitch: 1.0,
        rate: 1.0,
        description: 'Set your own pitch & rate',
    },
]

// ─── Speech-to-Text (Listening) ──────────────────────────────────────────────

type ListenCallback = {
    onResult: (text: string) => void
    onEnd: () => void
    onError: (err: string) => void
}

let recognitionInstance: any = null

export function isSTTSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
}

export function startListening(callbacks: ListenCallback, lang = 'en-US') {
    const SpeechRecognitionCtor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognitionCtor) {
        callbacks.onError('Speech recognition not supported in this browser.')
        return
    }

    recognitionInstance = new SpeechRecognitionCtor()
    recognitionInstance.lang = lang
    recognitionInstance.interimResults = false
    recognitionInstance.maxAlternatives = 1
    recognitionInstance.continuous = false

    recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        callbacks.onResult(transcript)
    }

    recognitionInstance.onerror = (event: any) => {
        if (event.error === 'no-speech') {
            callbacks.onError('No speech detected. Try again.')
        } else if (event.error === 'not-allowed') {
            callbacks.onError('Microphone access denied. Check browser permissions.')
        } else {
            callbacks.onError(`Speech error: ${event.error}`)
        }
    }

    recognitionInstance.onend = () => {
        callbacks.onEnd()
    }

    recognitionInstance.start()
}

export function stopListening() {
    if (recognitionInstance) {
        recognitionInstance.stop()
        recognitionInstance = null
    }
}

// ─── Text-to-Speech (Speaking) ───────────────────────────────────────────────

let currentUtterance: SpeechSynthesisUtterance | null = null

export function isTTSSupported(): boolean {
    return 'speechSynthesis' in window
}

/**
 * Get all available voices, filtered to English by default.
 */
export function getAvailableVoices(englishOnly = true): SpeechSynthesisVoice[] {
    const voices = window.speechSynthesis.getVoices()
    if (!englishOnly) return voices
    return voices.filter((v) => v.lang.startsWith('en'))
}

/**
 * Pick a voice by name, or auto-select the best one.
 */
function resolveVoice(voiceName: string): SpeechSynthesisVoice | null {
    const voices = window.speechSynthesis.getVoices()
    if (voices.length === 0) return null

    // If user picked a specific voice
    if (voiceName) {
        const match = voices.find((v) => v.name === voiceName)
        if (match) return match
    }

    // Auto-pick: prefer voices that pitch-shift well
    const preferred = [
        'Samantha',          // macOS / iOS — clean
        'Karen',             // macOS — Australian, fun pitched up
        'Moira',             // macOS — Irish
        'Tessa',             // macOS — South African
        'Google US English', // Chrome
        'Microsoft Zira',    // Windows
        'Daniel',            // macOS — British
    ]

    for (const name of preferred) {
        const match = voices.find((v) => v.name.includes(name))
        if (match) return match
    }

    // Fallback to first English voice
    const englishVoice = voices.find((v) => v.lang.startsWith('en'))
    return englishVoice || voices[0]
}

interface SpeakOptions {
    onStart?: () => void
    onEnd?: () => void
    onError?: (err: string) => void
}

/**
 * Speak text using settings from the store.
 */
export function speak(
    text: string,
    settings: Pick<CubeBotSettings, 'voiceName' | 'voicePitch' | 'voiceRate'>,
    options: SpeakOptions = {}
) {
    if (!isTTSSupported()) {
        options.onError?.('Text-to-speech not supported.')
        return
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    currentUtterance = utterance

    // Apply settings
    utterance.pitch = Math.max(0, Math.min(2, settings.voicePitch))
    utterance.rate = Math.max(0.1, Math.min(2, settings.voiceRate))
    utterance.volume = 1.0

    // Pick voice
    const voice = resolveVoice(settings.voiceName)
    if (voice) utterance.voice = voice

    utterance.onstart = () => options.onStart?.()
    utterance.onend = () => {
        currentUtterance = null
        options.onEnd?.()
    }
    utterance.onerror = (e) => {
        currentUtterance = null
        options.onError?.(`Speech error: ${e.error}`)
    }

    window.speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
    window.speechSynthesis.cancel()
    currentUtterance = null
}

export function isSpeaking(): boolean {
    return window.speechSynthesis.speaking
}

/**
 * Ensure voices are loaded (async in some browsers).
 * Call once on app init.
 */
export function preloadVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
        const voices = window.speechSynthesis.getVoices()
        if (voices.length > 0) {
            resolve(voices)
            return
        }
        window.speechSynthesis.onvoiceschanged = () => {
            resolve(window.speechSynthesis.getVoices())
        }
        // Timeout fallback
        setTimeout(() => resolve(window.speechSynthesis.getVoices()), 2000)
    })
}
