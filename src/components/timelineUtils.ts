import type { RealtimeEventType } from '../types/events';

export type TimelineLane = 'connection' | 'messages' | 'errors';

export const laneForEvent = (type: RealtimeEventType): TimelineLane => {
  if (type === 'connect' || type === 'disconnect') {
    return 'connection';
  }

  if (type === 'message' || type === 'ack') {
    return 'messages';
  }

  return 'errors';
};

export const asPercent = (value: number, max: number): number => (max <= 0 ? 0 : (value / max) * 100);
