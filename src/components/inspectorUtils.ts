import type { RealtimeEvent, TransportState } from '../types/events';

export type FlagTone = 'success' | 'warn' | 'info';

export interface DerivedFlag {
  label: string;
  tone: FlagTone;
}

export interface SubscriptionSnapshot {
  channels: string[];
  activeChannel?: string;
  observedCount: number;
}

export interface PayloadSection {
  key: string;
  value: unknown;
  kind: 'primitive' | 'structured';
}

export interface AnomalyCallout {
  title: string;
  detail: string;
  tone: Exclude<FlagTone, 'success'>;
}

export const deriveFlags = (state: TransportState): DerivedFlag[] => {
  const flags: DerivedFlag[] = [];

  if (state.retries > 1) {
    flags.push({ label: 'retry storm', tone: 'warn' });
  }

  if (state.drops > 0) {
    flags.push({ label: 'dropped packets', tone: 'warn' });
  }

  if (state.duplicates > 0) {
    flags.push({ label: 'duplicates seen', tone: 'warn' });
  }

  if (state.pendingAcks > 2) {
    flags.push({ label: 'ack backlog', tone: 'warn' });
  }

  if (state.phase === 'reconnecting') {
    flags.push({ label: 'reconnect in progress', tone: 'info' });
  }

  return flags.length ? flags : [{ label: 'stable', tone: 'success' }];
};

export const collectSubscriptionSnapshot = (events: RealtimeEvent[], cursor: number): SubscriptionSnapshot => {
  if (cursor < 0 || events.length === 0) {
    return { channels: [], observedCount: 0 };
  }

  const boundedCursor = Math.min(cursor, events.length - 1);
  const observed = events.slice(0, boundedCursor + 1);
  const channels = Array.from(new Set(observed.map((event) => event.channel))).sort();

  return {
    channels,
    activeChannel: observed[observed.length - 1]?.channel,
    observedCount: channels.length
  };
};

const isStructured = (value: unknown): value is Record<string, unknown> | unknown[] => {
  return typeof value === 'object' && value !== null;
};

export const splitPayloadSections = (payload: Record<string, unknown>): PayloadSection[] => {
  return Object.entries(payload).map(([key, value]) => ({
    key,
    value,
    kind: isStructured(value) ? 'structured' : 'primitive'
  }));
};

export const collectAnomalies = (state: TransportState, selectedEvent?: RealtimeEvent): AnomalyCallout[] => {
  const callouts: AnomalyCallout[] = [];

  if (selectedEvent?.type === 'duplicate') {
    callouts.push({
      title: 'Duplicate delivery',
      detail: 'Event appears to have been emitted more than once.',
      tone: 'warn'
    });
  }

  if (selectedEvent?.type === 'drop') {
    callouts.push({
      title: 'Dropped packet',
      detail: 'Transport reported packet loss; replay/retry likely required.',
      tone: 'warn'
    });
  }

  if (selectedEvent?.type === 'retry') {
    callouts.push({
      title: 'Reconnect retry',
      detail: 'Backoff in progress while transport attempts recovery.',
      tone: 'info'
    });
  }

  if (state.pendingAcks > 2) {
    callouts.push({
      title: 'ACK backlog',
      detail: `${state.pendingAcks} acknowledgements are still pending.`,
      tone: 'warn'
    });
  }

  if (state.retries > 2) {
    callouts.push({
      title: 'Retry storm',
      detail: `${state.retries} retries observed in this playback window.`,
      tone: 'warn'
    });
  }

  return callouts;
};
