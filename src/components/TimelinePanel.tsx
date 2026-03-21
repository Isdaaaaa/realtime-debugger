import type { RealtimeEvent } from '../types/events';

interface TimelinePanelProps {
  events: RealtimeEvent[];
  cursor: number;
}

const eventTone: Record<RealtimeEvent['type'], string> = {
  connect: 'border-debug-success/70 bg-debug-success/10 text-debug-success',
  message: 'border-debug-accent/60 bg-debug-accent/10 text-debug-accent',
  retry: 'border-debug-warn/60 bg-debug-warn/10 text-debug-warn',
  drop: 'border-red-500/60 bg-red-500/10 text-red-300',
  duplicate: 'border-fuchsia-500/60 bg-fuchsia-500/10 text-fuchsia-300',
  ack: 'border-debug-success/60 bg-debug-success/10 text-debug-success',
  disconnect: 'border-slate-500/80 bg-slate-700/40 text-slate-300',
};

export function TimelinePanel({ events, cursor }: TimelinePanelProps) {
  return (
    <section className="flex h-full min-h-[28rem] flex-col rounded-xl border border-debug-border bg-debug-panel/95 p-4 shadow-pulse">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-debug-muted">Timeline</p>
          <h2 className="text-lg font-semibold text-debug-text">Transport + Event Stream</h2>
        </div>
        <span className="rounded-md border border-debug-accent/40 bg-debug-accent/10 px-2 py-1 text-xs text-debug-accent">
          Cursor: {cursor}
        </span>
      </header>

      <div className="grid flex-1 gap-3 overflow-auto pr-1">
        {events.map((event, index) => (
          <article
            key={event.id}
            className={`rounded-lg border p-3 transition ${
              index === cursor ? 'scale-[1.01] border-debug-accent shadow-pulse' : 'border-debug-border'
            }`}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${eventTone[event.type]}`}>
                {event.type}
              </span>
              <span className="font-mono text-xs text-debug-muted">t+{event.atMs}ms</span>
            </div>
            <p className="text-sm text-debug-text">{event.summary}</p>
            <p className="mt-1 font-mono text-xs text-debug-muted">{event.channel}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
