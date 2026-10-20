import { describe, expect, it } from 'vitest';
import { dropFlight, liquidMotion } from '../src/story/liquidMotion';

describe('espresso flow', () => {
  it('uses individual drops at the beginning and end of extraction', () => {
    for (const p of [.722, .865]) {
      const flow = liquidMotion(p, 0);
      expect(flow.ribbon).toBe(0);
      expect(flow.drops).toBeGreaterThan(.5);
    }
  });
  it('breaks the main pour into intermittent drops and resumes', () => {
    expect(liquidMotion(.8, .4).ribbon).toBeGreaterThan(.9);
    expect(liquidMotion(.8, 1.9).ribbon).toBeLessThan(.01);
    expect(liquidMotion(.8, 1.9).drops).toBeGreaterThan(.9);
    expect(liquidMotion(.8, 2.8).ribbon).toBeGreaterThan(.9);
  });
  it('turns off all liquid effects outside extraction, including when seeking backward', () => {
    for (const p of [0, .69, .9, 1]) {
      const flow = liquidMotion(p, 123);
      expect(flow.active).toBe(false);
      expect(flow.ribbon).toBe(0);
      expect(flow.drops).toBe(0);
    }
    for (let t = 0; t < 5; t += .02) {
      const drop = dropFlight(t, 0, 0);
      expect(drop.t).toBeGreaterThanOrEqual(0);
      expect(drop.t).toBeLessThanOrEqual(1);
    }
  });
});
