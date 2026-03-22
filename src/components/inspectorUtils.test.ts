import { describe, expect, it } from 'vitest';
import { scenarioFixtures } from '../data/scenarios';
import type { TransportState } from '../types/events';
import { collectAnomalies, collectSubscriptionSnapshot, deriveFlags, splitPayloadSections } from './inspectorUtils';

const baseState: TransportState = {
  phase: 'connected',
  activeScenario: 'chat-presence',
  cursor: 0,
  pendingAcks: 0,
  retries: 0,
  drops: 0,
  duplicates: 0,
  messagesReceived: 1
};

describe('inspectorUtils', () => {
  it('derives stable/signal flags from transport state', () => {
    expect(deriveFlags(baseState)).toEqual([{ label: 'stable', tone: 'success' }]);

    const unstable = deriveFlags({
      ...baseState,
      phase: 'reconnecting',
      retries: 2,
      drops: 1,
      duplicates: 1,
      pendingAcks: 3
    });

    expect(unstable.map((flag) => flag.label)).toEqual([
      'retry storm',
      'dropped packets',
      'duplicates seen',
      'ack backlog',
      'reconnect in progress'
    ]);
  });

  it('collects channel subscriptions up to the active cursor', () => {
    const events = scenarioFixtures['chat-presence'].events;

    expect(collectSubscriptionSnapshot(events, -1)).toEqual({ channels: [], observedCount: 0 });

    expect(collectSubscriptionSnapshot(events, 2)).toEqual({
      channels: ['presence:lobby'],
      activeChannel: 'presence:lobby',
      observedCount: 1
    });
  });

  it('splits payload entries by primitive/structured sections', () => {
    const sections = splitPayloadSections({
      ackId: 'm_88',
      metadata: { attempt: 1 },
      ids: ['a', 'b']
    });

    expect(sections).toEqual([
      { key: 'ackId', value: 'm_88', kind: 'primitive' },
      { key: 'metadata', value: { attempt: 1 }, kind: 'structured' },
      { key: 'ids', value: ['a', 'b'], kind: 'structured' }
    ]);
  });

  it('returns anomaly callouts for selected event and state conditions', () => {
    const event = scenarioFixtures['chat-presence'].events.find((entry) => entry.type === 'drop');
    const callouts = collectAnomalies({ ...baseState, pendingAcks: 4, retries: 3 }, event);

    expect(callouts.map((entry) => entry.title)).toEqual(['Dropped packet', 'ACK backlog', 'Retry storm']);
  });
});
