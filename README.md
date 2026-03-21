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

## Current slice status (slice-000)
- Project scaffolding initialized
- Tailwind token system wired
- Two-panel timeline + inspector layout shell in place
- Sample event fixtures and mock transport adapter added
