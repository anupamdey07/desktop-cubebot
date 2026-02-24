# 🤖 Desktop CubeBot V2.0

> **Your sassy, cube-shaped desk pet living on your workstation.**  
> equal parts helpful sidekick, tiny cheerleader, and dramatic theater kid—with a 90s cartoon robot voice in its soul.

![CubeBot Preview](https://github.com/anupamdey07/desktop-cubebot/blob/main/public/cubebot-icon.svg)

Desktop CubeBot is an interactive AI companion project featuring a high-fidelity DIY/Maker aesthetic. It combines modern LLM intelligence (Moonshot AI) with a retro-industrial hardware design, complete with animated eyes, a terminal-style LCD, and a cartoon robot personality.

## ✨ Features

### 🛠️ V2.0 Hardware Aesthetic (DIY/Maker Edition)
*   **Sage Green Aluminum Frame**: Industrial chassis with visible 3D-print layer line textures.
*   **Black Corner Pillars**: Vertical structural supports with realistic hex bolt sockets.
*   **Blue Stereocam Eyes**: "CAM-L" and "CAM-R" lenses with reflective glass effects and eye-tracking pupils.
*   **Retro LCD Terminal**: A dark green high-contrast screen with scanlines, boot-up ASCII art, and terminal-style brackets.
*   **Hardware Details**: Exposed wire harnesses (colored), PCB trace decorations labeled "PCB-REV3.1", IR sensors, and cooling vent slots.
*   **Interactive Details**: Red-tipped antenna with a pulsing status LED and rubber vibration-dampening feet.

### 🎤 Voice & Personality
*   **Cartoon Robot Tone**: Tuned for a "caffeinated desk gremlin" vibe using the Web Speech API.
*   **7 Voice Presets**: Quick-toggle between mode-specific tones:
    *   🤖 **Cartoon Robot**: Sassy and snappy (Default)
    *   🐿️ **Chipmunk**: Tiny and squeaky
    *   🔊 **Deep Bot**: Authoritative rumble
    *   📖 **Narrator**: Calm and professional
    *   ⚡ **Hyper Mode**: Caffeinated speedrun
    *   😴 **Sleepy Bot**: Drowsy wind-down
    *   🎛️ **Custom**: Dial in your own Pitch and Rate
*   **Hands-Free Interaction**: Integrated STT (Speech-to-Text) with a pulsing mic button and auto-speak responses.
*   **Dynamic Animations**: The bot wiggles/pets on touch, blinks naturally, tracks your cursor, and animates its grin/waveform while thinking or speaking.

### 🧠 The Intelligence
*   **The "Super Prompt"**: A carefully crafted system personality that ensures CubeBot is short, punchy, and provides "Cube Wisdom" zingers.
*   **Moonshot AI Integration**: High-speed, streaming completions with support for 8K to 128K context windows.
*   **Configuration**: Full control over Temperature, Max Tokens, and System Prompt via the slide-out Settings Panel.

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or later)
*   A Moonshot AI API Key (from [platform.moonshot.cn](https://platform.moonshot.cn))

### Installation
1.  **Clone the repo**
    ```bash
    git clone https://github.com/anupamdey07/desktop-cubebot.git
    cd desktop-cubebot
    ```
2.  **Install dependencies**
    ```bash
    npm install
    ```
3.  **Setup Environment**
    Create a `.env` file in the root:
    ```bash
    VITE_CUBEBOT_API_KEY=your_key_here
    ```
4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    *Open `http://localhost:5173` in your browser.*

## 📱 Mobile & PWA
CubeBot is optimized for mobile (e.g., Pixel 9a, iPad). 
- **Full-width chat area**: Optimized for thumb-typing and vertical screens.
- **Installable**: Open in Chrome (Android) or Safari (iOS) and select "Add to Home Screen" to use it as a standalone PWA.

## 🛠️ Tech Stack
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Custom CSS (for hardware textures)
- **Animations**: Framer Motion
- **Voice**: Web Speech API (STT/TTS)
- **State**: Zustand (with Persist middleware)
- **Icons**: Lucide React

## 📄 License
This project is for personal exploration. All hardware design caricatures are inspired by modern maker-culture prototypes.

---
*Spin to win! 🌀*
