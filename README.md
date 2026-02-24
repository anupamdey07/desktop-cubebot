# 🤖 Desktop CubeBot

> **Your sassy, cube-shaped AI desk pet — with a cartoon robot voice.**  
> Equal parts helpful sidekick, tiny cheerleader, and dramatic theater kid.

---

## 📸 Overview

Desktop CubeBot is an interactive AI companion built as a Progressive Web App (PWA). It features a physically-inspired DIY/Maker cube robot with animated eyes, a retro terminal LCD, and full voice interaction — all running in the browser with zero backend.

| Feature | Details |
|---|---|
| **AI Engine** | Moonshot AI (streaming completions, 8K–128K context) |
| **Voice In** | Web Speech API `SpeechRecognition` (STT) |
| **Voice Out** | Web Speech API `SpeechSynthesis` (TTS) with cartoon presets |
| **PWA** | Installable on iOS, Android, and desktop |
| **Framework** | React 18 + Vite + Tailwind CSS + Framer Motion |
| **State** | Zustand with localStorage persistence |

---

## ✨ Features

### 🛠️ V2 Hardware Aesthetic (DIY/Maker Edition)

The CubeBot's visual design is inspired by a physical prototype — a sage green aluminum cube with edge-computing hardware:

- **Sage green 3D-printed frame** with visible layer line textures
- **Black corner pillars** with hex bolt socket detail
- **Blue stereocam lenses** ("CAM-L" / "CAM-R") with iris reflections and eye-tracking pupils
- **Dark LCD terminal screen** with green scanlines, ASCII boot art, and waveform animations
- **Exposed wire harness** (red / yellow / blue / green) above the screen
- **PCB trace decorations** with "PCB-REV3.1" label below the screen
- **IR sensor** and mounting screws between the cameras
- **Red-tipped antenna** with pulsing status LED
- **Cooling vent slots** on the top rail
- **Rubber vibration-dampening feet**

### 🎤 Voice Interaction

Full hands-free conversation loop — speak to the bot, get a cartoon voice reply:

```
🎤 Tap mic → SpeechRecognition listens → transcribed text →
  Moonshot AI (streaming) → response text → SpeechSynthesis reads it back 🔊
```

**Key details:**
- **🔊 Speaker toggle** (top-right corner) — one click enables TTS and satisfies Chrome's autoplay gesture requirement
- **🎤 Mic button** (left of chat input) — pulses red while listening, auto-transcribes
- **Auto-speak** — bot responses are read aloud when voice is enabled
- **Chrome workarounds** — silent utterance unlock on first click, periodic `pause()/resume()` to prevent the 15-second Chrome speech bug

### 🎛️ 7 Voice Presets

Quick-toggle between personality-matched tones in Settings → Voice & Speech:

| Preset | Emoji | Pitch | Rate | Vibe |
|---|---|---|---|---|
| **Cartoon Robot** | 🤖 | 1.5 | 1.15 | Sassy, snappy desk gremlin (default) |
| **Chipmunk** | 🐿️ | 2.0 | 1.4 | Tiny, fast, and squeaky |
| **Deep Bot** | 🔊 | 0.6 | 0.9 | Low rumble, authoritative AI |
| **Narrator** | 📖 | 1.0 | 0.95 | Calm, natural storyteller |
| **Hyper Mode** | ⚡ | 1.3 | 1.6 | Caffeinated speedrun energy |
| **Sleepy Bot** | 😴 | 0.8 | 0.7 | Drowsy and slow wind-down |
| **Custom** | 🎛️ | — | — | Set your own pitch & rate sliders |

### 🧠 The Super Prompt

CubeBot's personality is defined by a detailed system prompt that ensures:
- **Short, punchy replies** (1–3 sentences max)
- **5 personality modes**: `[CALM]`, `[HYPE]`, `[SNEAKY]`, `[FOCUS]`, `[SLEEPY]`
- **Mood-reactive voice** — the AI's mood tag is parsed and automatically adjusts the TTS voice:

| Mood Tag | Pitch | Rate | Effect |
|---|---|---|---|
| `[CALM]` | 0.9 | 0.9 | Gentle, slower |
| `[HYPE]` | 1.5 | 1.3 | Excited, higher, faster |
| `[SNEAKY]` | 1.2 | 1.0 | Mischievous, mid-high |
| `[FOCUS]` | 1.0 | 1.1 | Professional, crisp |
| `[SLEEPY]` | 0.7 | 0.65 | Drowsy, low, slow |

> The mood tag is stripped from the displayed text — users only see the clean response.

- **Cube Wisdom** zingers in every reply
- **Quick win choices** (A/B/C) for actionable suggestions
- Boundaries: no medical/legal advice, no pretending to see/hear surroundings

### ⚙️ Settings Panel

Slide-out panel (gear icon, top-right) with two organized sections:

**Voice & Speech:**
- Auto-speak toggle (on/off)
- Voice preset grid (7 presets)
- System voice dropdown (all available English voices)
- Pitch slider (0–2, labeled Deep → Chipmunk)
- Speed slider (0.1–2, labeled Slow → Fast)
- STT microphone language (English, German, Spanish, French, Hindi, Japanese, Chinese, Bengali)
- Test Voice button

**AI Settings:**
- API Key input
- Model selector (8K / 32K / 128K context)
- System prompt editor
- Temperature slider (Precise → Creative)
- Max tokens slider

### 🤏 Interactive Animations

- **Eye tracking** — pupils follow your cursor/finger
- **Natural blinking** — async blink cycle per eye
- **Petting** — tap/click the bot for a wiggle + 💚 heart animation
- **Waveform** — LCD bars animate while speaking/thinking
- **Status pill** — shows ONLINE / PROCESSING / TRANSMITTING / FAULT
- **Floating idle** — gentle vertical bob when idle

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or later
- **Moonshot AI API Key** — get one at [platform.moonshot.cn](https://platform.moonshot.cn)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/anupamdey07/desktop-cubebot.git
cd desktop-cubebot

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env and paste your API key:
# VITE_CUBEBOT_API_KEY=sk-your-key-here

# 4. Run development server
npm run dev
```

Open **http://localhost:5173** in Chrome/Edge/Safari.

### Network access (iPad / phone)

The dev server binds to `--host`, so any device on the same WiFi can access it:

```
http://<your-local-ip>:5173
```

### Build for production

```bash
npm run build
npm run preview
```

---

## 📱 PWA Installation

Desktop CubeBot is a Progressive Web App:

| Platform | How to install |
|---|---|
| **Android (Chrome)** | Menu → "Add to Home Screen" |
| **iOS (Safari)** | Share → "Add to Home Screen" |
| **Desktop (Chrome)** | Address bar → Install icon |

---

## 🗂️ Project Structure

```
desktop-cubebot/
├── index.html                    # Entry point + PWA meta tags
├── public/
│   ├── manifest.json             # PWA manifest
│   └── cubebot-icon.svg          # App icon
├── src/
│   ├── components/
│   │   ├── bot/
│   │   │   └── CubeBot.tsx       # Full robot: frame, eyes, LCD, antenna
│   │   ├── chat/
│   │   │   ├── ChatInput.tsx     # Text input + mic button
│   │   │   └── ChatMessage.tsx   # Message bubble component
│   │   └── layout/
│   │       └── SettingsPanel.tsx  # Settings drawer (voice + AI)
│   ├── hooks/
│   │   └── useCubeBotChat.ts     # Chat loop: send → stream → auto-speak
│   ├── pages/
│   │   └── ChatPage.tsx          # Main page: bot + input + voice toggle
│   ├── services/
│   │   ├── cubeBotApi.ts         # Moonshot AI streaming API
│   │   └── voiceService.ts       # STT + TTS + presets + Chrome workarounds
│   ├── store/
│   │   └── useChatStore.ts       # Zustand store (persisted to localStorage)
│   ├── styles/
│   │   └── index.css             # Custom CSS (scanlines, waveform, cursor)
│   └── types/
│       └── index.ts              # TypeScript interfaces
├── .env                          # API key (not committed)
├── .env.example                  # Template for .env
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + TypeScript |
| **Build tool** | Vite 5 |
| **Styling** | Tailwind CSS + custom CSS |
| **Animations** | Framer Motion |
| **Voice (STT)** | Web Speech API — `SpeechRecognition` / `webkitSpeechRecognition` |
| **Voice (TTS)** | Web Speech API — `SpeechSynthesis` with pitch/rate tuning |
| **State** | Zustand with `persist` middleware (localStorage) |
| **Icons** | Lucide React |
| **AI Backend** | Moonshot AI API (`api.moonshot.cn/v1`) — streaming SSE |

---

## 🏷️ Version History

| Tag | Description |
|---|---|
| `v1.0` | Clean prototype matching physical hardware design |
| `v2.0` | DIY edge-computing aesthetic — layer lines, hex bolts, PCB traces |
| `v2.1` | Full voice integration — STT, TTS, 7 presets, settings panel |
| `v2.2` | Bug fixes — Chrome autoplay unlock, localStorage migration, pitch safety |
| `v2.3` | Mood-reactive voice (AI tags → dynamic pitch/rate), empty-message API guard |

---

## 🐛 Known Browser Quirks

| Issue | Workaround |
|---|---|
| Chrome blocks TTS unless user gesture | Click the 🔊 button once per session |
| Chrome pauses TTS after ~15 seconds | Periodic `pause()/resume()` keepalive |
| Safari STT requires HTTPS in production | Use `localhost` for dev, HTTPS for deploy |
| Voice list loads async in Chrome | `onvoiceschanged` event + timeout fallback |
| Old localStorage missing voice fields | `onRehydrateStorage` merges `DEFAULT_SETTINGS` |

---

## 📄 License

This project is for personal exploration and learning. All hardware design caricatures are inspired by modern maker-culture prototypes.

---

*Spin to win! 🌀*
