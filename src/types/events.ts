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

export interface ScenarioDefinition {
  name: string;
  description: string;
  events: RealtimeEvent[];
}

export interface ScenarioPreset {
  id: string;
  label: string;
  summary: string;
  expectedBehavior: string;
  observedBehavior: string;
  rootCauseHint: string;
}

export interface TimelineEvent {
  index: number;
  event: RealtimeEvent;
  emittedAtMs: number;
  emittedAtIso: string;
}

export interface PlaybackState {
  scenarioName: string;
  cursor: number;
  currentTimeMs: number;
  isPlaying: boolean;
  speedMultiplier: number;
}

export interface TransportState {
  phase: TransportPhase;
  activeScenario: string;
  cursor: number;
  pendingAcks: number;
  retries: number;
  drops: number;
  duplicates: number;
  messagesReceived: number;
}
