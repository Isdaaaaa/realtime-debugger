# Realtime Debugger

A visual playground for debugging realtime message flows with deterministic mock scenarios.

## Stack
- React + TypeScript + Vite
- Tailwind CSS design tokens from `PROJECT_DESIGN.md`
- Mocked transport/event fixtures (prepared for upcoming XState integration)

## Setup
```bash
npm install
```

## Run locally
```bash
npm run dev
```

## Quality checks
```bash
npm run typecheck
npm run build
npm run test
```

## Current slice status (slice-001)
- Deterministic `ScenarioEngine` added with playback hooks: `play`, `pause`, `stepForward`, `stepBackward`, `seekToIndex`, `seekToTime`, and speed multiplier support
- Named scenario fixtures introduced (`chat-presence`, `retry-storm`) and loaded through the mock transport
- Mock transport now simulates lifecycle transitions (connect/reconnect/disconnect), retries, drops, duplicates, message/ack accounting
- Vitest coverage added for ordering determinism and transport simulation behavior
