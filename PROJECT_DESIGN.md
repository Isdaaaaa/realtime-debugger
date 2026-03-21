# Project Design

## Personality
Crisp, technical, confident. Feels like a purpose-built debugging instrument rather than a flashy marketing site.

## Colors
- Slate background: #0f172a
- Panel surface: #111827
- Accents: electric blue (#38bdf8) for realtime highlights, amber (#f59e0b) for warnings, emerald (#10b981) for success/connected states
- Text: off-white (#e5e7eb) with muted gray (#9ca3af) for secondary labels

## Typography
- Display & UI: Inter or SF Pro, 14–16px base with tighter line height
- Monospace for payloads/state: JetBrains Mono or Fira Code

## Components & Layout
- Two-column layout: timeline on the left, inspector/notes on the right
- Timeline: stacked lanes for connection state, messages, and errors; include cursor with current time marker
- State inspector: card stack showing connection status, subscriptions, pending acks, and derived client flags
- Payload viewer: collapsible JSON panels with syntax highlighting and diffing for duplicates
- Controls: playback bar with play/pause, step forward/back, speed toggle (0.25×–2×), and "jump to event" dropdown

## Visual Flourishes
- Use subtle glows/pulses on live events during playback
- Tag chips for event types (connect, message, retry, drop, duplicate)
- Inline callouts for detected anomalies ("out-of-order", "retry storm", "dropped")

## Inspiration References
- Realtime dashboards from LogRocket/Lightrun (clarity-first)
- Timeline UIs like Chrome DevTools Performance panel
- State machine inspectors from XState Viz
