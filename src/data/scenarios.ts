import type { ScenarioDefinition } from '../types/events';

const chatPresenceScenario: ScenarioDefinition = {
  name: 'chat-presence',
  description: 'Presence channel lifecycle with retries, duplicate delivery, and packet loss.',
  events: [
    {
      id: 'evt-000',
      atMs: 0,
      type: 'connect',
      channel: 'presence:lobby',
      summary: 'WebSocket connected',
      payload: { sessionId: 'sess_42', transport: 'ws' }
    },
    {
      id: 'evt-001',
      atMs: 240,
      type: 'message',
      channel: 'presence:lobby',
      summary: 'User joined lobby',
      payload: { userId: 'u_7', state: 'online', messageId: 'm_88' }
    },
    {
      id: 'evt-002',
      atMs: 400,
      type: 'duplicate',
      channel: 'presence:lobby',
      summary: 'Duplicate join event observed',
      payload: { userId: 'u_7', messageId: 'm_88' }
    },
    {
      id: 'evt-003',
      atMs: 640,
      type: 'ack',
      channel: 'presence:lobby',
      summary: 'Server ACK received for join event',
      payload: { ackId: 'm_88' }
    },
    {
      id: 'evt-004',
      atMs: 980,
      type: 'drop',
      channel: 'presence:lobby',
      summary: 'Heartbeat packet dropped',
      payload: { reason: 'packet-loss', packetId: 'hb_03' }
    },
    {
      id: 'evt-005',
      atMs: 1200,
      type: 'retry',
      channel: 'presence:lobby',
      summary: 'Reconnect backoff started',
      payload: { attempt: 1, jitterMs: 320 }
    },
    {
      id: 'evt-006',
      atMs: 1560,
      type: 'connect',
      channel: 'presence:lobby',
      summary: 'Transport reconnected',
      payload: { sessionId: 'sess_43', resumed: true }
    },
    {
      id: 'evt-007',
      atMs: 1900,
      type: 'disconnect',
      channel: 'presence:lobby',
      summary: 'Transport closed by server',
      payload: { code: 1012, reason: 'service restart' }
    }
  ]
};

const retryStormScenario: ScenarioDefinition = {
  name: 'retry-storm',
  description: 'Rapid reconnect attempts with repeated retries and eventual stabilization.',
  events: [
    {
      id: 'storm-000',
      atMs: 0,
      type: 'connect',
      channel: 'orders:stream',
      summary: 'Connected to orders stream',
      payload: { sessionId: 'sess_99' }
    },
    {
      id: 'storm-001',
      atMs: 120,
      type: 'message',
      channel: 'orders:stream',
      summary: 'Order update pushed',
      payload: { orderId: 'ord_1', status: 'pending', messageId: 'msg_1' }
    },
    {
      id: 'storm-002',
      atMs: 240,
      type: 'drop',
      channel: 'orders:stream',
      summary: 'Primary stream socket dropped',
      payload: { reason: 'network-jitter' }
    },
    {
      id: 'storm-003',
      atMs: 260,
      type: 'retry',
      channel: 'orders:stream',
      summary: 'Reconnect retry #1',
      payload: { attempt: 1 }
    },
    {
      id: 'storm-004',
      atMs: 320,
      type: 'retry',
      channel: 'orders:stream',
      summary: 'Reconnect retry #2',
      payload: { attempt: 2 }
    },
    {
      id: 'storm-005',
      atMs: 600,
      type: 'connect',
      channel: 'orders:stream',
      summary: 'Recovered after retries',
      payload: { sessionId: 'sess_100', resumed: true }
    }
  ]
};

export const scenarioFixtures: Record<string, ScenarioDefinition> = {
  [chatPresenceScenario.name]: chatPresenceScenario,
  [retryStormScenario.name]: retryStormScenario
};

export const defaultScenarioName = chatPresenceScenario.name;
