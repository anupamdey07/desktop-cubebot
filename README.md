# Desktop Cube Bot — Kimi 🤖

A premium, animated AI desktop companion powered by the **Moonshot AI (Kimi)** API.

## Features
- 🧊 **Animated Cube Bot** — eyes track your cursor, mouth reacts to AI state
- 📡 **Streaming responses** — real-time SSE streaming from Kimi API
- 🔐 **API Key stored locally** — never leaves your browser
- 🎛️ **Settings panel** — model selector, super prompt editor, temperature/token controls
- 💬 **Conversation history** — persisted in localStorage via Zustand
- 🎨 **Glassmorphism UI** — dark, premium aesthetic

## Tech Stack
Same architecture as **machbar-io**:
- **Vite 5** + **React 18** + **TypeScript**
- **Tailwind CSS v3** for styling
- **Framer Motion** for animations
- **Zustand** (with persist middleware) for state
- **React Router** for routing

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run dev server**
   ```bash
   npm run dev
   ```
   The app opens at `http://localhost:5173`

3. **Add your Kimi API key**
   - Click the ⚙️ Settings icon
   - Paste your key from [platform.moonshot.cn](https://platform.moonshot.cn)
   - Start chatting!

## Environment (Optional)
You can also pre-set an API key via `.env`:
```
VITE_KIMI_API_KEY=sk-your-key-here
```

## Project Structure
```
src/
├── components/
│   ├── bot/         # CubeBot animated character
│   ├── chat/        # ChatMessage + ChatInput
│   └── layout/      # SettingsPanel
├── hooks/           # useKimiChat (streaming orchestration)
├── pages/           # ChatPage
├── services/        # kimiApi.ts (SSE streaming client)
├── store/           # useChatStore (Zustand)
├── styles/          # index.css
└── types/           # TypeScript types
```
