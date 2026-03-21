# Realtime Debugger — Plan

## Summary
A visual, interactive playground for inspecting, simulating, and debugging WebSocket/SSE message flows. Runs entirely on mocked scenarios so it’s easy to demo and reason about realtime UX failures.

## Target User
- Frontend and full-stack engineers who integrate realtime features
- Developer relations folks teaching realtime concepts
- Product/QA engineers diagnosing reconnect and ordering issues

## Portfolio Positioning
Signals systems awareness plus strong frontend UX. Shows the ability to make invisible state and timing issues legible with clear debugging affordances.

## MVP Scope
- Mocked transport layer with deterministic event sequences
- Scenario presets (chat presence, live notifications, reconnect storm)
- Timeline view with payloads and connection events
- State inspector showing client state over time
- Step/auto-play controls with speed adjustments
- Explanation panel highlighting likely root causes (duplication, missed messages, ordering)

## Non-Goals (MVP)
- Hosting a real WebSocket backend
- Collaborative editing or multi-user sync
- Authentication and role-based permissions
- Persisted user projects

## Technical Approach
- React + TypeScript + Vite for fast iteration
- XState for connection/state machine modeling
- Visx or lightweight timeline components for visualizing event streams
- Mock transport service generating scripted event sequences
- Tailwind for styling; simple design tokens defined up front

## Execution Notes
- Keep scenarios data-driven (JSON) to add presets without code churn
- Ensure time travel controls (seek to event index, pause, resume) are deterministic
- Favor clear, labeled UI over heavy animations; clarity sells the value
- Capture GIFs of a reconnect bug walkthrough for the portfolio
