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

// ─── Mood Tag → Voice Mapping ────────────────────────────────────────────────
// The super prompt makes CubeBot start replies with [CALM], [HYPE], etc.
// We parse that tag, strip it from the display text, and use a matching voice.

export const MOOD_VOICE_MAP: Record<string, { pitch: number; rate: number }> = {
    // ── Core 5 emotions (the REAL voice tones) ──
    CALM: { pitch: 0.9, rate: 0.9 },  // gentle, reassuring
    HYPE: { pitch: 1.8, rate: 1.3 },  // excited, celebratory — cranked up!
    SNEAKY: { pitch: 1.2, rate: 1.0 },  // mischievous, playful
    FOCUS: { pitch: 1.0, rate: 1.1 },  // professional, crisp
    SLEEPY: { pitch: 0.7, rate: 0.65 },  // drowsy, winding down
    // ── Context aliases (map to closest core emotion) ──
    BOOT: { pitch: 1.8, rate: 1.3 },  // → HYPE (startup energy)
    SENSOR: { pitch: 1.0, rate: 1.1 },  // → FOCUS (data/diagnostics)
    QUEST: { pitch: 1.2, rate: 1.0 },  // → SNEAKY (adventure)
    TEACH: { pitch: 0.9, rate: 0.9 },  // → CALM (patient instructor)
    WARN: { pitch: 1.0, rate: 1.1 },  // → FOCUS (serious safety)
}

/**
 * Parse a mood tag like "[HYPE]" from the start of bot output.
 * ALWAYS strips the tag from displayed text, even if it's not in MOOD_VOICE_MAP.
 * Returns the tag name (if recognized) and the cleaned text (tag removed).
 */
export function parseMoodTag(text: string): { mood: string | null; cleanText: string } {
    // Matches [TAG] or **[TAG]** at the start, allowing for spaces or minor leading punctuation
    // e.g. " [HYPE]", "**[FOCUS]**", "Okay, [CALM]"
    const match = text.match(/^\s*(?:\*\*)?\[([A-Z]+)\](?:\*\*)?\s*/)
    if (match) {
        const tag = match[1]
        const cleanText = text.slice(match[0].length)
        return {
            mood: tag in MOOD_VOICE_MAP ? tag : null,
            cleanText,  // tag is ALWAYS stripped regardless
        }
    }
    return { mood: null, cleanText: text }
}

/**
 * Speak text with dynamic mood-based voice.
 * If the text starts with [HYPE], [CALM], etc., it uses the matching voice preset.
 * Otherwise falls back to the user's configured settings.
 */
export function speakWithMood(
    text: string,
    settings: Pick<CubeBotSettings, 'voiceName' | 'voicePitch' | 'voiceRate'>,
    options: SpeakOptions = {}
) {
    const { mood, cleanText } = parseMoodTag(text)

    if (mood && MOOD_VOICE_MAP[mood]) {
        const moodVoice = MOOD_VOICE_MAP[mood]
        speak(cleanText, {
            voiceName: settings.voiceName,
            voicePitch: moodVoice.pitch,
            voiceRate: moodVoice.rate,
        }, options)
    } else {
        speak(cleanText, settings, options)
    }
}

// ─── Chrome autoplay unlock ───────────────────────────────────────────────────
// Chrome blocks speechSynthesis.speak() unless it's been triggered by a user
// gesture at least once. We fire a silent 0-volume utterance on first interaction.

let _speechUnlocked = false

export function unlockSpeech() {
    if (_speechUnlocked || !('speechSynthesis' in window)) return
    try {
        const silent = new SpeechSynthesisUtterance(' ')
        silent.volume = 0.01 // near-silent but not 0 (some browsers reject 0)
        silent.pitch = 1     // safe default
        silent.rate = 1      // safe default
        window.speechSynthesis.speak(silent)
        _speechUnlocked = true
    } catch (e) {
        console.warn('Could not unlock speech:', e)
    }
}

// ─── Speech-to-Text (Listening) ──────────────────────────────────────────────

type ListenCallback = {
    onResult: (text: string) => void
    onEnd: () => void
    onError: (err: string) => void
    onRecordingStateChange?: (isRecording: boolean) => void
}

let recognitionInstance: any = null

export function isSTTSupported(): boolean {
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
}

/**
 * Browser Web Speech API STT — "Restart Session" Pattern
 *
 * Why: Chrome on Mac silently fails with continuous:true — it starts (onstart fires),
 * then drops without firing onresult. This is a known Chrome/Mac bug from 2017+.
 *
 * Fix: Use continuous:false (single-utterance mode — works on ALL platforms).
 * After each onend, immediately start a new session if the user hasn't clicked stop.
 * This gives the same UX (mic stays open) while being universally compatible.
 *
 * Supported on: Mac Chrome ✅, Android Chrome ✅, Safari ✅, Firefox ❌ (no STT)
 */
let _sttIsActive = false   // user intent: are we supposed to be listening?

export function startListening(callbacks: ListenCallback, lang = 'en-US') {
    const SpeechRecognitionCtor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognitionCtor) {
        callbacks.onError('Speech recognition not supported in this browser. Try Chrome.')
        return
    }

    unlockSpeech()

    _sttIsActive = true
    let finalTranscript = ''

    // Tell the UI we are recording IMMEDIATELY (before async onstart)
    callbacks.onRecordingStateChange?.(true)
    console.log(`[STT] startListening — lang=${lang} (restart-session mode)`)

    function createAndStartSession() {
        if (!_sttIsActive) return

        const rec = new SpeechRecognitionCtor()
        rec.lang = lang
        rec.interimResults = true   // Show words building up in real time
        rec.maxAlternatives = 1
        rec.continuous = false      // Single-utterance — universally compatible ✅

        rec.onstart = () => {
            console.log('[STT] session started — mic open')
        }

        rec.onresult = (event: any) => {
            // Accumulate final results; show interim immediately
            let sessionFinal = ''
            let sessionInterim = ''
            for (let i = 0; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    sessionFinal += event.results[i][0].transcript
                } else {
                    sessionInterim += event.results[i][0].transcript
                }
            }
            if (sessionFinal) {
                finalTranscript += sessionFinal + ' '
                console.log(`[STT] final: "${sessionFinal}" | total: "${finalTranscript.trim()}"`)
            }
            // Show combined accumulated + current interim in text box
            const display = (finalTranscript + sessionInterim).trim()
            if (display) callbacks.onResult(display)
        }

        rec.onerror = (event: any) => {
            if (event.error === 'aborted' || event.error === 'no-speech') {
                // 'no-speech' is normal — browser detected silence, will restart
                console.log(`[STT] session event: ${event.error} — restarting if active`)
                return
            }
            if (event.error === 'not-allowed') {
                _sttIsActive = false
                callbacks.onError('Microphone access denied. Check browser + macOS permissions.')
                callbacks.onRecordingStateChange?.(false)
                callbacks.onEnd()
            } else {
                console.error(`[STT] error: ${event.error}`)
            }
        }

        rec.onend = () => {
            console.log(`[STT] session ended — active=${_sttIsActive}`)
            if (_sttIsActive) {
                // Restart immediately for next utterance (this is the key Mac fix)
                try { createAndStartSession() } catch (e) { console.warn('[STT] restart failed:', e) }
            } else {
                // User clicked stop — deliver final result
                const result = finalTranscript.trim()
                console.log(`[STT] done, final transcript: "${result}"`)
                if (result) callbacks.onResult(result)
                callbacks.onRecordingStateChange?.(false)
                callbacks.onEnd()
            }
        }

        recognitionInstance = rec
        try {
            rec.start()
        } catch (e: any) {
            console.error('[STT] .start() threw:', e)
            if (_sttIsActive) {
                // Brief delay and retry — sometimes needed if Chrome is still releasing mic
                setTimeout(() => { if (_sttIsActive) createAndStartSession() }, 300)
            }
        }
    }

    createAndStartSession()
}

export function stopListening() {
    console.log('[STT] stopListening called')
    _sttIsActive = false  // Signal sessions to stop restarting
    if (recognitionInstance) {
        try { recognitionInstance.stop() } catch (_) {}
        recognitionInstance = null
    }
}



// ─── Text-to-Speech (Speaking) ───────────────────────────────────────────────

let currentUtterance: SpeechSynthesisUtterance | null = null
let speakQueue: SpeechSynthesisUtterance[] = []
let isProcessingQueue = false

export function isTTSSupported(): boolean {
    return 'speechSynthesis' in window
}

/**
 * Get all available voices, filtered to English by default.
 */
export function getAvailableVoices(englishOnly = true): SpeechSynthesisVoice[] {
    if (!isTTSSupported()) return []
    const voices = window.speechSynthesis.getVoices()
    if (!englishOnly) return voices
    return voices.filter((v) => v.lang.startsWith('en'))
}

/**
 * Pick a voice by name, or auto-select the best one for pitch-shifting.
 */
function resolveVoice(voiceName: string): SpeechSynthesisVoice | null {
    if (!isTTSSupported()) return null
    const voices = window.speechSynthesis.getVoices()
    if (voices.length === 0) return null

    // User-selected specific voice
    if (voiceName) {
        const exactMatch = voices.find((v) => v.name === voiceName)
        if (exactMatch) return exactMatch

        // Try fuzzy match (e.g. "Aaron" matches "Aaron (en-US)")
        const fuzzyMatch = voices.find((v) => v.name.toLowerCase().includes(voiceName.toLowerCase()))
        if (fuzzyMatch) return fuzzyMatch
    }

    // Auto-pick: prefer voices that pitch-shift well
    const preferred = [
        'Samantha',          // macOS / iOS — cleanest for pitch shifting
        'Karen',             // macOS Australian
        'Moira',             // macOS Irish
        'Tessa',             // macOS South African
        'Google US English', // Chrome desktop
        'Microsoft Zira',    // Windows
        'Daniel',            // macOS British
    ]

    for (const name of preferred) {
        const match = voices.find((v) => v.name.includes(name))
        if (match) return match
    }

    // Fallback to first English voice
    return voices.find((v) => v.lang.startsWith('en')) || voices[0]
}

interface SpeakOptions {
    onStart?: () => void
    onEnd?: () => void
    onError?: (err: string) => void
}

/**
 * Internal queue processor for short chunks
 */
function processQueue(options: SpeakOptions) {
    if (speakQueue.length === 0) {
        isProcessingQueue = false
        options.onEnd?.()
        return
    }

    isProcessingQueue = true
    const utterance = speakQueue.shift()!
    currentUtterance = utterance

    utterance.onend = () => {
        processQueue(options) // advance queue
    }

    utterance.onerror = (e) => {
        if (e.error === 'interrupted' || e.error === 'canceled') {
            speakQueue = []
            options.onEnd?.()
            return
        }
        speakQueue = []
        options.onError?.(`Speech error: ${e.error}`)
    }

    window.speechSynthesis.speak(utterance)
}

/**
 * Speak text with CubeBot's voice settings.
 * We split long paragraphs into sentences to bypass the Chrome 15-second TTS hang bug.
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

    // Cancel any ongoing speech and clear queue
    window.speechSynthesis.cancel()
    speakQueue = []
    isProcessingQueue = false
    currentUtterance = null

    // Clamp to valid ranges per MDN spec
    const pitch = Math.max(0, Math.min(2, settings.voicePitch))
    const rate = Math.max(0.1, Math.min(10, settings.voiceRate))

    // Truncate very long responses heavily, then chunk by punctuation
    const MAX_CHARS = 4000
    const rawText = text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) + '… truncated.' : text

    // Strip emojis, markdown syntax, and decorative characters before speaking
    const cleanText = rawText
        .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')   // emoji ranges (emoticons, symbols, misc)
        .replace(/[\u{2600}-\u{26FF}]/gu, '')       // misc symbols (☀️ ⚡ ✅ etc)
        .replace(/[\u{2700}-\u{27BF}]/gu, '')       // dingbats
        .replace(/[\u{FE00}-\u{FE0F}]/gu, '')       // variation selectors
        .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')     // flags
        .replace(/\*\*(.*?)\*\*/g, '$1')             // **bold** → bold
        .replace(/\*(.*?)\*/g, '$1')                 // *italic* → italic
        .replace(/`{1,3}[^`]*`{1,3}/g, '')          // `code` / ```code``` → remove
        .replace(/#{1,6}\s/g, '')                    // ## Heading → Heading
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')    // [text](url) → text
        .replace(/[>\-_~|]/g, ' ')                   // blockquote/list/hr chars → space
        .replace(/\s{2,}/g, ' ')                     // collapse multiple spaces
        .trim()

    // Regex splits by sentence boundary (greedy dot/exclamation/question mark followed by space)
    const sentences = cleanText.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g)?.map(s => s.trim()).filter(Boolean) || [cleanText]

    // Pick voice (may return null if voices not loaded yet)
    const voice = resolveVoice(settings.voiceName)

    sentences.forEach((sentence, index) => {
        const utterance = new SpeechSynthesisUtterance(sentence)
        utterance.pitch = pitch
        utterance.rate = rate
        utterance.volume = 1.0
        if (voice) utterance.voice = voice

        // Trigger onStart only for the very first chunk in the sequence
        if (index === 0) {
            utterance.onstart = () => options.onStart?.()
        }

        speakQueue.push(utterance)
    })

    processQueue(options)
}

export function stopSpeaking() {
    speakQueue = []
    window.speechSynthesis.cancel()
    currentUtterance = null
    isProcessingQueue = false
}

export function isSpeaking(): boolean {
    return 'speechSynthesis' in window && window.speechSynthesis.speaking
}

/**
 * Ensure voices are loaded (they load async in Chrome via onvoiceschanged).
 * Call once on app init.
 */
export function preloadVoices(): Promise<SpeechSynthesisVoice[]> {
    if (!isTTSSupported()) return Promise.resolve([])

    return new Promise((resolve) => {
        const voices = window.speechSynthesis.getVoices()
        if (voices.length > 0) {
            resolve(voices)
            return
        }
        // Chrome fires voiceschanged event when voices load
        window.speechSynthesis.onvoiceschanged = () => {
            resolve(window.speechSynthesis.getVoices())
        }
        // Timeout fallback for browsers without the event
        setTimeout(() => resolve(window.speechSynthesis.getVoices()), 2000)
    })
}
