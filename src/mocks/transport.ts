import { defaultScenarioName, scenarioFixtures } from '../data/scenarios';
import { ScenarioEngine } from '../engine/scenarioEngine';
import type { RealtimeEvent, ScenarioDefinition, TimelineEvent, TransportState } from '../types/events';

export interface MockTransport {
  readonly initialState: TransportState;
  getEvents(): RealtimeEvent[];
  getEventAt(cursor: number): RealtimeEvent | undefined;
  getState(): TransportState;
  play(): TransportState;
  pause(): TransportState;
  setSpeed(multiplier: number): TransportState;
  stepForward(): TimelineEvent | undefined;
  stepBackward(): TimelineEvent | undefined;
  seekToIndex(index: number): TimelineEvent | undefined;
  seekToTime(atMs: number): TimelineEvent | undefined;
}

const baseState = (scenarioName: string): TransportState => ({
  phase: 'connecting',
  activeScenario: scenarioName,
  cursor: -1,
  pendingAcks: 0,
  retries: 0,
  drops: 0,
  duplicates: 0,
  messagesReceived: 0
});

const applyEvent = (state: TransportState, event: RealtimeEvent): TransportState => {
  const next = { ...state };

  switch (event.type) {
    case 'connect':
      next.phase = 'connected';
      break;
    case 'retry':
      next.phase = 'reconnecting';
      next.retries += 1;
      break;
    case 'disconnect':
      next.phase = 'disconnected';
      break;
    case 'drop':
      next.phase = 'disconnected';
      next.drops += 1;
      break;
    case 'duplicate':
      next.duplicates += 1;
      break;
    case 'message':
      next.messagesReceived += 1;
      next.pendingAcks += 1;
      break;
    case 'ack':
      next.pendingAcks = Math.max(0, next.pendingAcks - 1);
      break;
    default:
      break;
  }

  return next;
};

export const createMockTransport = (scenarioName = defaultScenarioName): MockTransport => {
  const scenario: ScenarioDefinition | undefined = scenarioFixtures[scenarioName];
  if (!scenario) {
    throw new Error(`Unknown scenario: ${scenarioName}`);
  }

  const engine = new ScenarioEngine(scenario);
  const initialState = baseState(scenario.name);
  let transportState = { ...initialState };

  const rebuildStateAtCursor = (cursor: number): void => {
    const events = engine.getEvents();
    let next = baseState(scenario.name);

    for (let index = 0; index <= cursor; index += 1) {
      const event = events[index];
      if (!event) {
        break;
      }

      next = applyEvent(next, event);
      next.cursor = index;
    }

    transportState = next;
  };

  return {
    initialState,
    getEvents: () => engine.getEvents(),
    getEventAt: (cursor: number) => engine.getEvents()[cursor],
    getState: () => ({ ...transportState }),
    play: () => {
      engine.play();
      return { ...transportState };
    },
    pause: () => {
      engine.pause();
      return { ...transportState };
    },
    setSpeed: (multiplier: number) => {
      engine.setSpeed(multiplier);
      return { ...transportState };
    },
    stepForward: () => {
      const event = engine.stepForward();
      if (!event) {
        return undefined;
      }

      transportState = applyEvent(transportState, event.event);
      transportState.cursor = event.index;
      return event;
    },
    stepBackward: () => {
      const previous = engine.stepBackward();
      const playbackState = engine.getState();
      rebuildStateAtCursor(playbackState.cursor);
      return previous;
    },
    seekToIndex: (index: number) => {
      const target = engine.seekToIndex(index);
      const playbackState = engine.getState();
      rebuildStateAtCursor(playbackState.cursor);
      return target;
    },
    seekToTime: (atMs: number) => {
      const target = engine.seekToTime(atMs);
      const playbackState = engine.getState();
      rebuildStateAtCursor(playbackState.cursor);
      return target;
    }
  };
};
