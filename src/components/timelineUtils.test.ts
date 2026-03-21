import { describe, expect, it } from 'vitest';
import { asPercent, laneForEvent } from './timelineUtils';

describe('timelineUtils', () => {
  it('maps event types into the expected visualization lanes', () => {
    expect(laneForEvent('connect')).toBe('connection');
    expect(laneForEvent('disconnect')).toBe('connection');
    expect(laneForEvent('message')).toBe('messages');
    expect(laneForEvent('ack')).toBe('messages');
    expect(laneForEvent('retry')).toBe('errors');
    expect(laneForEvent('drop')).toBe('errors');
    expect(laneForEvent('duplicate')).toBe('errors');
  });

  it('converts timeline offsets to percentages safely', () => {
    expect(asPercent(50, 200)).toBe(25);
    expect(asPercent(10, 0)).toBe(0);
  });
});
