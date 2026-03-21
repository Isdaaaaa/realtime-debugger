import { describe, expect, it } from 'vitest';
import { ScenarioEngine } from './scenarioEngine';
import type { ScenarioDefinition } from '../types/events';

describe('ScenarioEngine', () => {
  it('orders by timestamp and preserves fixture order for equal timestamps', () => {
    const scenario: ScenarioDefinition = {
      name: 'unordered',
      description: 'unordered fixture for determinism checks',
      events: [
        { id: 'c', atMs: 100, type: 'message', channel: 'x', summary: 'c', payload: {} },
        { id: 'a', atMs: 0, type: 'connect', channel: 'x', summary: 'a', payload: {} },
        { id: 'd', atMs: 100, type: 'duplicate', channel: 'x', summary: 'd', payload: {} },
        { id: 'b', atMs: 50, type: 'ack', channel: 'x', summary: 'b', payload: {} }
      ]
    };

    const engine = new ScenarioEngine(scenario);
    expect(engine.getEvents().map((event) => event.id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('supports step/seek controls and speed updates deterministically', () => {
    const scenario: ScenarioDefinition = {
      name: 'controls',
      description: 'control hooks',
      events: [
        { id: 'evt-0', atMs: 0, type: 'connect', channel: 'x', summary: 'connect', payload: {} },
        { id: 'evt-1', atMs: 100, type: 'message', channel: 'x', summary: 'message', payload: {} },
        { id: 'evt-2', atMs: 220, type: 'disconnect', channel: 'x', summary: 'disconnect', payload: {} }
      ]
    };

    const engine = new ScenarioEngine(scenario);
    expect(engine.getState().cursor).toBe(-1);

    expect(engine.stepForward()?.event.id).toBe('evt-0');
    expect(engine.stepForward()?.event.id).toBe('evt-1');

    const steppedBack = engine.stepBackward();
    expect(steppedBack?.event.id).toBe('evt-1');
    expect(engine.getState().cursor).toBe(0);

    expect(engine.seekToTime(180)?.event.id).toBe('evt-1');
    expect(engine.seekToIndex(99)?.event.id).toBe('evt-2');

    engine.setSpeed(2);
    expect(engine.getState().speedMultiplier).toBe(2);

    expect(() => engine.setSpeed(0)).toThrowError();
    expect(() => engine.seekToTime(-1)).toThrowError();
    expect(() => engine.seekToIndex(1.4)).toThrowError();
  });
});
