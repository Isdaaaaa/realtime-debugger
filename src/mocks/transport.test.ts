import { describe, expect, it } from 'vitest';
import { createMockTransport } from './transport';

describe('mock transport simulation', () => {
  it('simulates connection lifecycle and counters from scenario events', () => {
    const transport = createMockTransport('chat-presence');

    expect(transport.getState()).toMatchObject({
      phase: 'connecting',
      cursor: -1,
      pendingAcks: 0,
      retries: 0,
      drops: 0,
      duplicates: 0,
      messagesReceived: 0
    });

    const steps = transport.getEvents().map(() => transport.stepForward()?.event.type);
    expect(steps).toEqual(['connect', 'message', 'duplicate', 'ack', 'drop', 'retry', 'connect', 'disconnect']);

    expect(transport.getState()).toMatchObject({
      phase: 'disconnected',
      cursor: 7,
      pendingAcks: 0,
      retries: 1,
      drops: 1,
      duplicates: 1,
      messagesReceived: 1
    });
  });

  it('rebuilds deterministic state when stepping backward and seeking', () => {
    const transport = createMockTransport('retry-storm');

    transport.seekToTime(350);
    expect(transport.getState()).toMatchObject({
      phase: 'reconnecting',
      cursor: 4,
      retries: 2,
      drops: 1,
      messagesReceived: 1,
      pendingAcks: 1
    });

    transport.stepBackward();
    expect(transport.getState()).toMatchObject({
      phase: 'reconnecting',
      cursor: 3,
      retries: 1,
      drops: 1,
      messagesReceived: 1,
      pendingAcks: 1
    });

    transport.seekToIndex(0);
    expect(transport.getState()).toMatchObject({
      phase: 'connected',
      cursor: 0,
      retries: 0,
      drops: 0,
      messagesReceived: 0,
      pendingAcks: 0
    });
  });
});
