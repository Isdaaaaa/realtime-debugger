# Realtime Debugger

A portfolio-focused realtime debugging workbench that makes transport glitches visible with deterministic playback.

## What it demonstrates
- Timeline visualization of connection, message, retry, drop, duplicate, ack, and disconnect events
- Deterministic playback controls with step-through and speed control
- Scenario presets for chat presence, notification flow, and retry storms
- State inspector with derived flags and anomaly callouts
- Payload inspection with structured JSON sections
- Keyboard-first debugging workflow

## Stack
- React + TypeScript + Vite
- Tailwind CSS
- Vitest

## Run locally
```bash
npm install
npm run dev
```

## Quality checks
```bash
npm run typecheck
npm run test
npm run build
```

## Keyboard shortcuts
- `Space` or `K` — Play/Pause
- `←` / `→` — Step backward/forward
- `+` / `-` — Increase/decrease playback speed

## Demo capture workflow
1. Start the app: `npm run dev`
2. Pick **Retry Storm — ACK backlog and duplicate delivery**
3. Use **Step focus** and jump through retry/drop/duplicate events
4. Open payload + anomaly callouts in the inspector
5. Capture with your preferred tool (Kap, Screen Studio, OBS)
6. Keep clips under 20s and export at 1080p

### Suggested demo clips
- **Clip A:** Stable connection baseline + clean acks
- **Clip B:** Retry storm with delayed ACKs and duplicate delivery
- **Clip C:** Event filtering + timeline jump controls for root-cause isolation

## Accessibility and polish notes
- Control buttons and selectors include explicit labels
- Event filters expose pressed state
- Timeline event markers include descriptive labels
- Loading/empty states are intentional and styled to match design tokens
- Layout remains responsive for smaller viewports
