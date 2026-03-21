import { sampleChatPresenceScenario } from '../data/sampleEvents';
import type { RealtimeEvent, TransportState } from '../types/events';

export interface MockTransport {
  readonly initialState: TransportState;
  getEvents(): RealtimeEvent[];
  getEventAt(cursor: number): RealtimeEvent | undefined;
}

const initialState: TransportState = {
  phase: 'connecting',
  activeScenario: 'chat-presence',
  cursor: 0,
  pendingAcks: 0,
};

export const createMockTransport = (): MockTransport => ({
  initialState,
  getEvents: () => sampleChatPresenceScenario,
  getEventAt: (cursor: number) => sampleChatPresenceScenario[cursor],
});
