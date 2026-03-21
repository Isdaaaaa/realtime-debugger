import type { PlaybackState, RealtimeEvent, ScenarioDefinition, TimelineEvent } from '../types/events';

interface IndexedEvent {
  event: RealtimeEvent;
  originalIndex: number;
}

const DEFAULT_SPEED = 1;

const sortScenarioEvents = (events: RealtimeEvent[]): RealtimeEvent[] => {
  const indexed: IndexedEvent[] = events.map((event, index) => ({ event, originalIndex: index }));
  indexed.sort((a, b) => {
    if (a.event.atMs !== b.event.atMs) {
      return a.event.atMs - b.event.atMs;
    }

    return a.originalIndex - b.originalIndex;
  });

  return indexed.map(({ event }) => event);
};

const toIso = (milliseconds: number): string => new Date(milliseconds).toISOString();

export class ScenarioEngine {
  private readonly scenario: ScenarioDefinition;
  private readonly orderedEvents: RealtimeEvent[];
  private cursor = -1;
  private isPlaying = false;
  private speedMultiplier = DEFAULT_SPEED;

  constructor(scenario: ScenarioDefinition) {
    if (!scenario.events.length) {
      throw new Error(`Scenario "${scenario.name}" must contain at least one event.`);
    }

    this.scenario = scenario;
    this.orderedEvents = sortScenarioEvents(scenario.events);
  }

  getState(): PlaybackState {
    return {
      scenarioName: this.scenario.name,
      cursor: this.cursor,
      currentTimeMs: this.cursor >= 0 ? this.orderedEvents[this.cursor].atMs : 0,
      isPlaying: this.isPlaying,
      speedMultiplier: this.speedMultiplier
    };
  }

  getEvents(): RealtimeEvent[] {
    return [...this.orderedEvents];
  }

  play(): PlaybackState {
    this.isPlaying = true;
    return this.getState();
  }

  pause(): PlaybackState {
    this.isPlaying = false;
    return this.getState();
  }

  setSpeed(multiplier: number): PlaybackState {
    if (!Number.isFinite(multiplier) || multiplier <= 0) {
      throw new Error('Playback speed multiplier must be a finite number greater than 0.');
    }

    this.speedMultiplier = multiplier;
    return this.getState();
  }

  stepForward(): TimelineEvent | undefined {
    if (this.cursor >= this.orderedEvents.length - 1) {
      return undefined;
    }

    this.cursor += 1;
    return this.getTimelineEvent(this.cursor);
  }

  stepBackward(): TimelineEvent | undefined {
    if (this.cursor < 0) {
      return undefined;
    }

    const currentIndex = this.cursor;
    this.cursor -= 1;
    return this.getTimelineEvent(currentIndex);
  }

  seekToIndex(index: number): TimelineEvent | undefined {
    if (!Number.isInteger(index)) {
      throw new Error('seekToIndex expects an integer index.');
    }

    if (index < 0) {
      this.cursor = -1;
      return undefined;
    }

    if (index >= this.orderedEvents.length) {
      this.cursor = this.orderedEvents.length - 1;
      return this.getTimelineEvent(this.cursor);
    }

    this.cursor = index;
    return this.getTimelineEvent(index);
  }

  seekToTime(atMs: number): TimelineEvent | undefined {
    if (!Number.isFinite(atMs) || atMs < 0) {
      throw new Error('seekToTime expects a finite timestamp >= 0.');
    }

    const index = this.findIndexByTime(atMs);
    this.cursor = index;
    return index >= 0 ? this.getTimelineEvent(index) : undefined;
  }

  getCurrentEvent(): TimelineEvent | undefined {
    if (this.cursor < 0) {
      return undefined;
    }

    return this.getTimelineEvent(this.cursor);
  }

  private findIndexByTime(atMs: number): number {
    let result = -1;

    for (let index = 0; index < this.orderedEvents.length; index += 1) {
      if (this.orderedEvents[index].atMs <= atMs) {
        result = index;
      } else {
        break;
      }
    }

    return result;
  }

  private getTimelineEvent(index: number): TimelineEvent {
    const event = this.orderedEvents[index];
    return {
      index,
      event,
      emittedAtMs: event.atMs,
      emittedAtIso: toIso(event.atMs)
    };
  }
}
