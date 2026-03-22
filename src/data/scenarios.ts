import type { ScenarioDefinition, ScenarioPreset } from '../types/events';

const chatPresenceScenario: ScenarioDefinition = {
  name: 'chat-presence',
  description: 'Presence channel lifecycle with retries, duplicate delivery, and packet loss.',
  events: [
    { id: 'evt-000', atMs: 0, type: 'connect', channel: 'presence:lobby', summary: 'WebSocket connected', payload: { sessionId: 'sess_42', transport: 'ws' } },
    { id: 'evt-001', atMs: 240, type: 'message', channel: 'presence:lobby', summary: 'User joined lobby', payload: { userId: 'u_7', state: 'online', messageId: 'm_88' } },
    { id: 'evt-002', atMs: 400, type: 'duplicate', channel: 'presence:lobby', summary: 'Duplicate join event observed', payload: { userId: 'u_7', messageId: 'm_88' } },
    { id: 'evt-003', atMs: 640, type: 'ack', channel: 'presence:lobby', summary: 'Server ACK received for join event', payload: { ackId: 'm_88' } },
    { id: 'evt-004', atMs: 980, type: 'drop', channel: 'presence:lobby', summary: 'Heartbeat packet dropped', payload: { reason: 'packet-loss', packetId: 'hb_03' } },
    { id: 'evt-005', atMs: 1200, type: 'retry', channel: 'presence:lobby', summary: 'Reconnect backoff started', payload: { attempt: 1, jitterMs: 320 } },
    { id: 'evt-006', atMs: 1560, type: 'connect', channel: 'presence:lobby', summary: 'Transport reconnected', payload: { sessionId: 'sess_43', resumed: true } },
    { id: 'evt-007', atMs: 1900, type: 'disconnect', channel: 'presence:lobby', summary: 'Transport closed by server', payload: { code: 1012, reason: 'service restart' } }
  ]
};

const liveNotificationsScenario: ScenarioDefinition = {
  name: 'live-notifications',
  description: 'Notification fanout with ack backlog and out-of-order retries under brief degradation.',
  events: [
    { id: 'notif-000', atMs: 0, type: 'connect', channel: 'notifications:feed', summary: 'Notification stream connected', payload: { sessionId: 'notif_01' } },
    { id: 'notif-001', atMs: 90, type: 'message', channel: 'notifications:feed', summary: 'Comment notification received', payload: { messageId: 'n_100', kind: 'comment' } },
    { id: 'notif-002', atMs: 180, type: 'message', channel: 'notifications:feed', summary: 'Mention notification received', payload: { messageId: 'n_101', kind: 'mention' } },
    { id: 'notif-003', atMs: 250, type: 'drop', channel: 'notifications:feed', summary: 'ACK packet dropped by transport', payload: { packetId: 'ack_n100', reason: 'transient-loss' } },
    { id: 'notif-004', atMs: 330, type: 'retry', channel: 'notifications:feed', summary: 'Retry sending pending ACK batch', payload: { attempt: 1, queuedAcks: 2 } },
    { id: 'notif-005', atMs: 410, type: 'duplicate', channel: 'notifications:feed', summary: 'Duplicate mention notification delivered', payload: { messageId: 'n_101' } },
    { id: 'notif-006', atMs: 560, type: 'ack', channel: 'notifications:feed', summary: 'ACK delivered for first notification', payload: { ackId: 'n_100' } },
    { id: 'notif-007', atMs: 680, type: 'ack', channel: 'notifications:feed', summary: 'ACK delivered for mention notification', payload: { ackId: 'n_101' } },
    { id: 'notif-008', atMs: 860, type: 'connect', channel: 'notifications:feed', summary: 'Transport stabilized after retry cycle', payload: { resumed: true, sessionId: 'notif_02' } }
  ]
};

const retryStormScenario: ScenarioDefinition = {
  name: 'retry-storm',
  description: 'Rapid reconnect attempts with repeated retries and eventual stabilization.',
  events: [
    { id: 'storm-000', atMs: 0, type: 'connect', channel: 'orders:stream', summary: 'Connected to orders stream', payload: { sessionId: 'sess_99' } },
    { id: 'storm-001', atMs: 120, type: 'message', channel: 'orders:stream', summary: 'Order update pushed', payload: { orderId: 'ord_1', status: 'pending', messageId: 'msg_1' } },
    { id: 'storm-002', atMs: 240, type: 'drop', channel: 'orders:stream', summary: 'Primary stream socket dropped', payload: { reason: 'network-jitter' } },
    { id: 'storm-003', atMs: 260, type: 'retry', channel: 'orders:stream', summary: 'Reconnect retry #1', payload: { attempt: 1 } },
    { id: 'storm-004', atMs: 320, type: 'retry', channel: 'orders:stream', summary: 'Reconnect retry #2', payload: { attempt: 2 } },
    { id: 'storm-005', atMs: 410, type: 'retry', channel: 'orders:stream', summary: 'Reconnect retry #3', payload: { attempt: 3 } },
    { id: 'storm-006', atMs: 600, type: 'connect', channel: 'orders:stream', summary: 'Recovered after retries', payload: { sessionId: 'sess_100', resumed: true } }
  ]
};

export const scenarioFixtures: Record<string, ScenarioDefinition> = {
  [chatPresenceScenario.name]: chatPresenceScenario,
  [liveNotificationsScenario.name]: liveNotificationsScenario,
  [retryStormScenario.name]: retryStormScenario
};

export const scenarioPresets: ScenarioPreset[] = [
  {
    id: chatPresenceScenario.name,
    label: 'Chat Presence',
    summary: 'Presence lifecycle with duplicate joins and packet loss.',
    expectedBehavior: 'Presence updates reconcile after retry; pending ACKs should eventually drain.',
    observedBehavior: 'Duplicates and drops can temporarily desync roster state.',
    rootCauseHint: 'Watch duplicate count spikes after reconnect and stale ACK backlog.'
  },
  {
    id: liveNotificationsScenario.name,
    label: 'Live Notifications',
    summary: 'Notification fanout under dropped ACK and duplicate delivery.',
    expectedBehavior: 'Notification stream remains connected and catches up after ACK retries.',
    observedBehavior: 'Out-of-order retries briefly surface duplicate notifications.',
    rootCauseHint: 'Correlate pending ACK backlog with duplicate events on the same message id.'
  },
  {
    id: retryStormScenario.name,
    label: 'Reconnect Storm',
    summary: 'Repeated reconnect attempts before transport stabilizes.',
    expectedBehavior: 'Client enters reconnecting phase and stabilizes once connect succeeds.',
    observedBehavior: 'Multiple retries can create bursty latency and delayed payload handling.',
    rootCauseHint: 'Focus on retry cadence and whether reconnect finishes before next drop.'
  }
];

export const defaultScenarioName = chatPresenceScenario.name;
