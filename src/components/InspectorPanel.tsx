import type { RealtimeEvent, TransportState } from '../types/events';

interface InspectorPanelProps {
  state: TransportState;
  selectedEvent?: RealtimeEvent;
  isLoading: boolean;
}

const statusTone: Record<TransportState['phase'], string> = {
  connecting: 'text-debug-warn',
  connected: 'text-debug-success',
  reconnecting: 'text-debug-accent',
  disconnected: 'text-slate-300'
};

export function InspectorPanel({ state, selectedEvent, isLoading }: InspectorPanelProps) {
  const derivedFlags = [
    state.retries > 1 ? 'retry storm' : null,
    state.drops > 0 ? 'dropped packets' : null,
    state.duplicates > 0 ? 'duplicates seen' : null,
    state.pendingAcks > 2 ? 'ack backlog' : null
  ].filter(Boolean) as string[];

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
          <dt className="text-debug-muted">Messages</dt>
          <dd>{state.messagesReceived}</dd>
          <dt className="text-debug-muted">Retries / Drops</dt>
          <dd>
            {state.retries} / {state.drops}
          </dd>
        </dl>

        <div className="mt-3 flex flex-wrap gap-2">
          {derivedFlags.length ? (
            derivedFlags.map((flag) => (
              <span key={flag} className="rounded-full border border-debug-warn/40 bg-debug-warn/10 px-2 py-0.5 text-[11px] text-debug-warn">
                {flag}
              </span>
            ))
          ) : (
            <span className="rounded-full border border-debug-success/40 bg-debug-success/10 px-2 py-0.5 text-[11px] text-debug-success">
              stable
            </span>
          )}
        </div>
      </section>

      <section className="flex-1 rounded-lg border border-debug-border bg-black/10 p-3">
        <p className="text-xs uppercase tracking-[0.18em] text-debug-muted">Payload viewer</p>
        <h3 className="mt-1 text-base font-semibold">Selected Event</h3>

        {isLoading ? (
          <div className="mt-3 rounded-md border border-debug-border bg-slate-950/70 p-3 text-sm text-debug-muted">
            Waiting for event stream hydrate…
          </div>
        ) : selectedEvent ? (
          <pre className="mt-3 overflow-auto rounded-md border border-debug-border bg-slate-950/70 p-3 font-mono text-xs text-debug-text">
            {JSON.stringify(selectedEvent.payload, null, 2)}
          </pre>
        ) : (
          <div className="mt-3 rounded-md border border-dashed border-debug-border p-3 text-sm text-debug-muted">
            Move the cursor or jump to an event to inspect payloads and anomaly callouts.
          </div>
        )}
      </section>
    </aside>
  );
}
