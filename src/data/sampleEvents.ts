import type { RealtimeEvent } from '../types/events';

export const sampleChatPresenceScenario: RealtimeEvent[] = [
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
    atMs: 280,
    type: 'message',
    channel: 'presence:lobby',
    summary: 'User joined lobby',
    payload: { userId: 'u_7', state: 'online' }
  },
  {
    id: 'evt-002',
    atMs: 640,
    type: 'duplicate',
    channel: 'presence:lobby',
    summary: 'Duplicate join event observed',
    payload: { userId: 'u_7', messageId: 'm_88' }
  },
  {
    id: 'evt-003',
    atMs: 1200,
    type: 'retry',
    channel: 'presence:lobby',
    summary: 'Reconnect backoff started',
    payload: { attempt: 1, jitterMs: 320 }
  },
  {
    id: 'evt-004',
    atMs: 1900,
    type: 'disconnect',
    channel: 'presence:lobby',
    summary: 'Transport closed by server',
    payload: { code: 1012, reason: 'service restart' }
  }
];
