# Realtime Debugger

A visual, interactive playground for inspecting, simulating, and debugging WebSocket/SSE message flows. Runs entirely on mocked scenarios so it’s easy to demo and reason about realtime UX failures.

What it does

- Simulates realtime transports (WebSocket/SSE) with scripted scenarios.
- Visualizes connection events and messages on a timeline.
- Lets you step through, play, and seek event sequences deterministically.
- Shows client state snapshots aligned with timeline events to help surface ordering, duplication, and missed-message bugs.

Core features

- Mock transport service with deterministic event fixtures.
- Timeline view with grouped connection and message events.
- Playback controls (step, play/pause, speed, seek).
- Payload inspector with diffing to detect duplicates or missed messages.
- State inspector showing XState-driven client state over time.
- Preset scenarios (chat presence, reconnect storm, notification flows) for quick demos.

Why it matters

Realtime systems are hard to reason about because issues are transient and timing-dependent. This tool makes those invisible timing and ordering problems legible, helping engineers and QA reproduce, explain, and fix realtime UX failures faster.

Setup

Requirements:
- Node 18+ (or compatible)
- pnpm or npm

Install:

1. cd into the project
2. pnpm install

Run (development):

pnpm dev

Build:

pnpm build

Showcase notes

- Capture a short GIF showing a reconnect storm scenario with timeline + state inspector visible.
- Record a 60s demo script explaining how the timeline maps to client state and how to spot duplication or missed-message symptoms.
- Include links to the scenario JSON fixtures in the repo for reproducibility.

Limitations

- This is a mocked, local demo environment — it does not connect to a real backend.
- Not intended for collaborative editing or persisted user projects yet.
- No authentication or multi-user support in the MVP.

License

MIT
