import type { RealtimeEvent, RealtimeEventType } from '../types/events';
import { asPercent, laneForEvent, type TimelineLane } from './timelineUtils';

interface TimelinePanelProps {
  events: RealtimeEvent[];
  cursor: number;
  currentTimeMs: number;
  speed: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onSpeedChange: (speed: number) => void;
  onJumpToEvent: (index: number) => void;
  onSelectEvent: (index: number) => void;
  isLoading: boolean;
  activeFilters: RealtimeEventType[];
  filteredIndexes: number[];
  focusMode: 'all' | 'step';
  onToggleFilter: (eventType: RealtimeEventType) => void;
  onFocusModeChange: (mode: 'all' | 'step') => void;
}

const laneLabels: Record<TimelineLane, string> = {
  connection: 'Connection',
  messages: 'Messages',
  errors: 'Errors'
};

const speedOptions = [0.25, 0.5, 1, 1.5, 2] as const;

const eventTone: Record<RealtimeEventType, string> = {
  connect: 'bg-debug-success/80 shadow-[0_0_14px_rgba(16,185,129,0.45)]',
  message: 'bg-debug-accent/90 shadow-[0_0_14px_rgba(56,189,248,0.5)]',
  retry: 'bg-debug-warn/90 shadow-[0_0_14px_rgba(245,158,11,0.45)]',
  drop: 'bg-rose-400/90 shadow-[0_0_14px_rgba(251,113,133,0.45)]',
  duplicate: 'bg-fuchsia-400/90 shadow-[0_0_14px_rgba(232,121,249,0.45)]',
  ack: 'bg-emerald-300/90 shadow-[0_0_14px_rgba(110,231,183,0.45)]',
  disconnect: 'bg-slate-400/90 shadow-[0_0_14px_rgba(148,163,184,0.35)]'
};

export function TimelinePanel({
  events,
  cursor,
  currentTimeMs,
  speed,
  isPlaying,
  onTogglePlay,
  onStepForward,
  onStepBackward,
  onSpeedChange,
  onJumpToEvent,
  onSelectEvent,
  isLoading,
  activeFilters,
  filteredIndexes,
  focusMode,
  onToggleFilter,
  onFocusModeChange
}: TimelinePanelProps) {
  const lastTime = events.length ? events[events.length - 1].atMs : 1;
  const cursorPercent = Math.min(100, asPercent(currentTimeMs, lastTime));
  const visibleEntries = events
    .map((event, index) => ({ event, index }))
    .filter(({ index, event }) => filteredIndexes.includes(index) && (focusMode === 'all' || Math.abs(index - cursor) <= 3 || event.type !== 'message'));

  const annotationForEvent = (event: RealtimeEvent): string | null => {
    if (event.type === 'drop') return 'Packet dropped — verify retry handling';
    if (event.type === 'duplicate') return 'Duplicate delivery detected';
    if (event.type === 'retry') return 'Retry scheduled after failed attempt';
    if (event.type === 'ack' && String(event.payload?.delayed ?? '') === 'true') return 'Delayed ACK observed';
    return null;
  };

  return (
    <section className="flex h-full min-h-[28rem] flex-col rounded-xl border border-debug-border bg-debug-panel/95 p-4 shadow-pulse">
      <header className="mb-3 flex flex-col gap-3 border-b border-debug-border pb-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-debug-muted">Timeline</p>
          <h2 className="text-lg font-semibold text-debug-text">Transport + Event Stream</h2>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 md:flex md:flex-wrap md:items-center">
          <button type="button" onClick={onStepBackward} className="rounded-md border border-debug-border bg-slate-900/80 px-3 py-1.5 text-sm text-debug-text transition hover:border-debug-accent">
            ◀ Step
          </button>
          <button type="button" onClick={onTogglePlay} className="rounded-md border border-debug-accent/60 bg-debug-accent/10 px-3 py-1.5 text-sm text-debug-accent transition hover:bg-debug-accent/20">
            {isPlaying ? '❚❚ Pause' : '▶ Play'}
          </button>
          <button type="button" onClick={onStepForward} className="rounded-md border border-debug-border bg-slate-900/80 px-3 py-1.5 text-sm text-debug-text transition hover:border-debug-accent">
            Step ▶
          </button>

          <select
            value={String(speed)}
            onChange={(event) => onSpeedChange(Number(event.target.value))}
            className="rounded-md border border-debug-border bg-slate-950 px-2 py-1.5 text-xs text-debug-text"
          >
            {speedOptions.map((option) => (
              <option key={option} value={option}>
                {option}x
              </option>
            ))}
          </select>

          <select
            value={focusMode}
            onChange={(event) => onFocusModeChange(event.target.value as 'all' | 'step')}
            className="rounded-md border border-debug-border bg-slate-950 px-2 py-1.5 text-xs text-debug-text"
            aria-label="Step focus mode"
          >
            <option value="all">All events</option>
            <option value="step">Step focus</option>
          </select>

          <select
            value={cursor >= 0 ? String(cursor) : ''}
            onChange={(event) => onJumpToEvent(Number(event.target.value))}
            className="rounded-md border border-debug-border bg-slate-950 px-2 py-1.5 text-xs text-debug-text"
            aria-label="Jump to event"
          >
            <option value="" disabled>
              Jump to event…
            </option>
            {visibleEntries.map(({ event: entry, index }) => (
              <option key={entry.id} value={index}>
                #{index} • {entry.type} • t+{entry.atMs}ms
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {Object.keys(eventTone).map((key) => {
          const type = key as RealtimeEventType;
          const isActive = activeFilters.includes(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => onToggleFilter(type)}
              className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] ${
                isActive ? 'border-debug-accent/60 bg-debug-accent/10 text-debug-accent' : 'border-debug-border bg-slate-950/40 text-debug-muted'
              }`}
            >
              {type}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid flex-1 place-items-center rounded-lg border border-debug-border bg-slate-950/40">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-debug-muted">Loading scenario</p>
            <p className="mt-2 text-sm text-debug-text">Hydrating transport timeline…</p>
          </div>
        </div>
      ) : visibleEntries.length === 0 ? (
        <div className="grid flex-1 place-items-center rounded-lg border border-dashed border-debug-border bg-slate-950/40 p-6 text-center">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-debug-muted">No events</p>
            <p className="mt-2 text-sm text-debug-text">No transport activity yet. Start playback or load another scenario.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="relative mb-3 overflow-hidden rounded-lg border border-debug-border bg-slate-950/40 p-3">
            <div className="pointer-events-none absolute inset-y-2 z-10 w-px bg-debug-accent/80" style={{ left: `${cursorPercent}%` }}>
              <span className="absolute -left-10 -top-5 rounded border border-debug-accent/40 bg-debug-accent/10 px-1.5 py-0.5 font-mono text-[10px] text-debug-accent">
                t+{Math.round(currentTimeMs)}ms
              </span>
            </div>

            <div className="space-y-3">
              {(['connection', 'messages', 'errors'] as const).map((lane) => (
                <div key={lane} className="grid grid-cols-[7rem_1fr] items-center gap-3">
                  <p className="text-xs uppercase tracking-[0.12em] text-debug-muted">{laneLabels[lane]}</p>
                  <div className="relative h-10 rounded border border-debug-border bg-slate-900/70">
                    {visibleEntries
                      .filter(({ event }) => laneForEvent(event.type) === lane)
                      .map(({ event, index }) => {
                        const left = asPercent(event.atMs, lastTime);
                        const selected = index === cursor;

                        return (
                          <button
                            key={event.id}
                            type="button"
                            onClick={() => onSelectEvent(index)}
                            className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full transition ${eventTone[event.type]} ${
                              selected ? 'ring-2 ring-debug-text' : 'opacity-90 hover:opacity-100'
                            }`}
                            style={{ left: `${left}%` }}
                            title={`#${index} ${event.type} @ t+${event.atMs}ms`}
                          />
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid flex-1 gap-2 overflow-auto pr-1">
            {visibleEntries.map(({ event, index }) => (
              <article
                key={event.id}
                className={`rounded-lg border p-3 transition ${
                  index === cursor ? 'border-debug-accent bg-debug-accent/5 shadow-pulse' : 'border-debug-border bg-slate-950/30'
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="rounded-full border border-debug-border px-2 py-0.5 text-[11px] font-medium text-debug-text">{event.type}</span>
                  <span className="font-mono text-xs text-debug-muted">t+{event.atMs}ms</span>
                </div>
                <p className="text-sm text-debug-text">{event.summary}</p>
                <p className="mt-1 font-mono text-xs text-debug-muted">{event.channel}</p>
                {annotationForEvent(event) ? (
                  <p className="mt-2 rounded border border-debug-warn/30 bg-debug-warn/10 px-2 py-1 text-xs text-debug-warn">
                    {annotationForEvent(event)}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
