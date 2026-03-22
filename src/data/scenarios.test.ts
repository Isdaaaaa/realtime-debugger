import { describe, expect, it } from 'vitest';
import { defaultScenarioName, scenarioFixtures, scenarioPresets } from './scenarios';

describe('scenario presets', () => {
  it('all presets map to an existing fixture', () => {
    for (const preset of scenarioPresets) {
      expect(scenarioFixtures[preset.id]).toBeDefined();
      expect(scenarioFixtures[preset.id].events.length).toBeGreaterThan(0);
    }
  });

  it('includes required portfolio presets', () => {
    expect(defaultScenarioName).toBe('chat-presence');
    const ids = scenarioPresets.map((preset) => preset.id);
    expect(ids).toContain('chat-presence');
    expect(ids).toContain('live-notifications');
    expect(ids).toContain('reconnect-storm');
  });
});
