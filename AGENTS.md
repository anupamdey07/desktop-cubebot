# Desktop CubeBot

Sassy, cube-shaped AI desk pet PWA — animated eyes, retro terminal LCD, full voice interaction (STT/TTS via Web Speech API), cartoon robot voice. Zero backend.

## Trajectory
Key checkpoints: 2026-07 — V2 Hardware Aesthetic (DIY/Maker Edition) | Next: voice interaction polish

## Paths
- Specs: `~/projects/docs/specs/`
- Plans: `~/projects/docs/plans/`
- Backlog: `~/projects/docs/backlog.md`

## Tech Stack
| Layer | Choice |
|-------|--------|
| Frontend | React 18 + Vite + Tailwind CSS + Framer Motion |
| State | Zustand with localStorage persistence |
| AI | Moonshot AI (streaming completions, 8K–128K context) |
| Voice | Web Speech API (SpeechRecognition + SpeechSynthesis) |
| LLM | Moonshot AI (cloud) |

## Running
```bash
npm run dev          # Vite dev server on :5173
npm run build        # Production build
npm run preview      # Preview production build
```

## Working Rules
- Commit before reporting done
- Evidence: file paths, line numbers, errors
- Test on running service