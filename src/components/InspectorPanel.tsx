import type { RealtimeEvent, TransportState } from '../types/events';

interface InspectorPanelProps {
  state: TransportState;
  selectedEvent?: RealtimeEvent;
}

const statusTone: Record<TransportState['phase'], string> = {
  connecting: 'text-debug-warn',
  connected: 'text-debug-success',
  reconnecting: 'text-debug-accent',
  disconnected: 'text-slate-300',
};

export function InspectorPanel({ state, selectedEvent }: InspectorPanelProps) {
  return (
    <aside className="flex h-full min-h-[28rem] flex-col gap-3 rounded-xl border border-debug-border bg-debug-panel/90 p-4">
      <section className="rounded-lg border border-debug-border bg-black/20 p-3">
        <p className="text-xs uppercase tracking-[0.18em] text-debug-muted">State inspector</p>
        <h3 className="mt-1 text-base font-semibold">Client Snapshot</h3>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <dt className="text-debug-muted">Phase</dt>
          <dd className={statusTone[state.phase]}>{state.phase}</dd>
          <dt className="text-debug-muted">Scenario</dt>
          <dd>{state.activeScenario}</dd>
          <dt className="text-debug-muted">Pending ACKs</dt>
          <dd>{state.pendingAcks}</dd>
        </dl>
      </section>

      <section className="flex-1 rounded-lg border border-debug-border bg-black/10 p-3">
        <p className="text-xs uppercase tracking-[0.18em] text-debug-muted">Payload viewer</p>
        <h3 className="mt-1 text-base font-semibold">Selected Event</h3>

        {selectedEvent ? (
          <pre className="mt-3 overflow-auto rounded-md border border-debug-border bg-slate-950/70 p-3 font-mono text-xs text-debug-text">
            {JSON.stringify(selectedEvent.payload, null, 2)}
          </pre>
        ) : (
          <div className="mt-3 rounded-md border border-dashed border-debug-border p-3 text-sm text-debug-muted">
            Select or step to an event to inspect payloads and derived client flags.
          </div>
        )}
      </section>
    </aside>
  );
}
