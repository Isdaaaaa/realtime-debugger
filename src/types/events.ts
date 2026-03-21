export type TransportPhase = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export type RealtimeEventType =
  | 'connect'
  | 'message'
  | 'retry'
  | 'drop'
  | 'duplicate'
  | 'ack'
  | 'disconnect';

export interface RealtimeEvent {
  id: string;
  atMs: number;
  type: RealtimeEventType;
  channel: string;
  summary: string;
  payload: Record<string, unknown>;
}

export interface TransportState {
  phase: TransportPhase;
  activeScenario: string;
  cursor: number;
  pendingAcks: number;
}
