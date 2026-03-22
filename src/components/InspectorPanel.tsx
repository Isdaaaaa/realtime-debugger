import { Fragment } from 'react';
import type { RealtimeEvent, TransportState } from '../types/events';
import { collectAnomalies, collectSubscriptionSnapshot, deriveFlags, splitPayloadSections, type FlagTone } from './inspectorUtils';

interface InspectorPanelProps {
  state: TransportState;
  events: RealtimeEvent[];
  selectedEvent?: RealtimeEvent;
  isLoading: boolean;
}

const statusTone: Record<TransportState['phase'], string> = {
  connecting: 'text-debug-warn',
  connected: 'text-debug-success',
  reconnecting: 'text-debug-accent',
  disconnected: 'text-slate-300'
};

const chipTone: Record<FlagTone, string> = {
  success: 'border-debug-success/40 bg-debug-success/10 text-debug-success',
  warn: 'border-debug-warn/40 bg-debug-warn/10 text-debug-warn',
  info: 'border-debug-accent/40 bg-debug-accent/10 text-debug-accent'
};

interface JsonNodeProps {
  value: unknown;
  depth?: number;
  label?: string;
}

const JsonNode = ({ value, depth = 0, label }: JsonNodeProps) => {
  const isArray = Array.isArray(value);

  if (value === null || typeof value !== 'object') {
    const rendered = typeof value === 'string' ? `"${value}"` : String(value);
    return (
      <div className="font-mono text-xs leading-relaxed text-debug-text">
        {label ? <span className="text-debug-muted">{label}: </span> : null}
        <span className={typeof value === 'string' ? 'text-cyan-300' : 'text-emerald-300'}>{rendered}</span>
      </div>
    );
  }

  const entries = Object.entries(value);
  const isEmpty = entries.length === 0;
  const defaultOpen = depth <= 0;

  return (
    <details open={defaultOpen} className="rounded border border-debug-border/70 bg-slate-950/40 px-2 py-1">
      <summary className="cursor-pointer select-none font-mono text-xs text-debug-muted">
        {label ? `${label}: ` : ''}
        {isArray ? `Array(${entries.length})` : `Object(${entries.length})`}
      </summary>

      {isEmpty ? (
        <p className="mt-1 font-mono text-xs text-debug-muted">(empty)</p>
      ) : (
        <div className="mt-1 space-y-1 border-l border-debug-border/60 pl-2">
          {entries.map(([key, nested]) => (
            <JsonNode key={key} value={nested} label={isArray ? `[${key}]` : key} depth={depth + 1} />
          ))}
        </div>
      )}
    </details>
  );
};

export function InspectorPanel({ state, events, selectedEvent, isLoading }: InspectorPanelProps) {
  const derivedFlags = deriveFlags(state);
  const snapshot = collectSubscriptionSnapshot(events, state.cursor);
  const anomalies = collectAnomalies(state, selectedEvent);
  const payloadSections = selectedEvent ? splitPayloadSections(selectedEvent.payload) : [];

  return (
    <aside className="flex h-full min-h-[28rem] flex-col gap-3 rounded-xl border border-debug-border bg-debug-panel/90 p-3 sm:p-4" aria-label="Transport state inspector">
      <section className="rounded-lg border border-debug-border bg-black/20 p-3" aria-label="State inspector">
        <p className="text-xs uppercase tracking-[0.18em] text-debug-muted">State inspector</p>
        <h3 className="mt-1 text-base font-semibold">Client Snapshot</h3>

        {isLoading ? (
          <div className="mt-3 rounded-md border border-debug-border bg-slate-950/70 p-3 text-sm text-debug-muted" role="status" aria-live="polite">
            Collecting client state baseline…
          </div>
        ) : (
          <Fragment>
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm" aria-label="Client state metrics">
              <dt className="text-debug-muted">Phase</dt>
              <dd className={statusTone[state.phase]}>{state.phase}</dd>

              <dt className="text-debug-muted">Scenario</dt>
              <dd className="truncate">{state.activeScenario}</dd>

              <dt className="text-debug-muted">Pending ACKs</dt>
              <dd>{state.pendingAcks}</dd>

              <dt className="text-debug-muted">Messages</dt>
              <dd>{state.messagesReceived}</dd>

              <dt className="text-debug-muted">Retries / Drops</dt>
              <dd>
                {state.retries} / {state.drops}
              </dd>

              <dt className="text-debug-muted">Subscriptions</dt>
              <dd>{snapshot.observedCount}</dd>
            </dl>

            <div className="mt-3 rounded-md border border-debug-border bg-slate-950/40 p-2.5" role="group" aria-label="Observed channels">
              <p className="text-[11px] uppercase tracking-[0.12em] text-debug-muted">Connection + channels</p>
              {snapshot.channels.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {snapshot.channels.map((channel) => {
                    const active = channel === snapshot.activeChannel;
                    return (
                      <span
                        key={channel}
                        className={`rounded-full border px-2 py-0.5 font-mono text-[11px] ${
                          active
                            ? 'border-debug-accent/50 bg-debug-accent/10 text-debug-accent'
                            : 'border-debug-border bg-black/20 text-debug-muted'
                        }`}
                        aria-label={active ? `${channel}, active channel` : channel}
                      >
                        {channel}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-2 text-xs text-debug-muted">No subscriptions observed yet.</p>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2" role="list" aria-label="Derived client flags">
              {derivedFlags.map((flag) => (
                <span key={flag.label} className={`rounded-full border px-2 py-0.5 text-[11px] ${chipTone[flag.tone]}`} role="listitem">
                  {flag.label}
                </span>
              ))}
            </div>

            {anomalies.length > 0 ? (
              <div className="mt-3 space-y-2" role="list" aria-label="Detected anomalies">
                {anomalies.map((anomaly) => (
                  <div
                    key={anomaly.title}
                    className={`rounded-md border p-2 text-xs ${
                      anomaly.tone === 'warn'
                        ? 'border-debug-warn/40 bg-debug-warn/10 text-debug-warn'
                        : 'border-debug-accent/40 bg-debug-accent/10 text-debug-accent'
                    }`}
                    role="listitem"
                  >
                    <p className="font-semibold uppercase tracking-[0.08em]">{anomaly.title}</p>
                    <p className="mt-1 text-debug-text">{anomaly.detail}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </Fragment>
        )}
      </section>

      <section className="flex-1 rounded-lg border border-debug-border bg-black/10 p-3" aria-label="Payload viewer">
        <p className="text-xs uppercase tracking-[0.18em] text-debug-muted">Payload viewer</p>
        <h3 className="mt-1 text-base font-semibold">Selected Event</h3>

        {isLoading ? (
          <div className="mt-3 rounded-md border border-debug-border bg-slate-950/70 p-3 text-sm text-debug-muted" role="status" aria-live="polite">
            Waiting for event stream hydrate…
          </div>
        ) : selectedEvent ? (
          <div className="mt-3 space-y-2 overflow-auto pr-1" aria-label={`Payload for ${selectedEvent.type} event`}>
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-debug-border bg-slate-950/70 px-2.5 py-2">
              <span className="rounded-full border border-debug-border px-2 py-0.5 text-[11px] text-debug-text">{selectedEvent.type}</span>
              <span className="font-mono text-xs text-debug-muted">{selectedEvent.channel}</span>
            </div>

            {payloadSections.map((section) => (
              <div key={section.key}>
                {section.kind === 'primitive' ? (
                  <div className="rounded-md border border-debug-border bg-slate-950/70 px-2.5 py-2">
                    <JsonNode label={section.key} value={section.value} />
                  </div>
                ) : (
                  <JsonNode label={section.key} value={section.value} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-md border border-dashed border-debug-border p-3 text-sm text-debug-muted" role="status" aria-live="polite">
            Move the cursor or jump to an event to inspect payloads and anomaly callouts.
          </div>
        )}
      </section>
    </aside>
  );
}
