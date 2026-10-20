import { describe, it, expect } from 'vitest';
import { evaluateStory, beanFlight, cupSurface } from '../src/story/evaluateStory';

describe('reversible scroll story', () => {
  it('starts sealed and ends with a full cup and closed packaging', () => {
    const first = evaluateStory(0), last = evaluateStory(1);
    expect(first.mouth).toBe(0); expect(first.cupVisible).toBe(false);
    expect(last.mouth).toBe(0); expect(last.cupFill).toBe(1); expect(last.stream).toBe(0); expect(last.chapter).toBe(5);
  });
  it('fills grounds before the portafilter transfer and positions the cup before pouring', () => {
    expect(evaluateStory(.49).groundsFill).toBe(1);
    expect(evaluateStory(.49).transfer).toBe(0);
    expect(evaluateStory(.705).cupArrival).toBe(1);
    expect(evaluateStory(.70).stream).toBe(0);
  });
  it('does not depend on scrolling direction or intermediate frames', () => {
    const samples = [.01, .16, .29, .42, .56, .73, .85, .97];
    const forward = samples.map(evaluateStory);
    expect([...samples].reverse().map(evaluateStory).reverse()).toEqual(forward);
  });
  it('bounds progress and handles invalid input', () => {
    expect(evaluateStory(-5)).toEqual(evaluateStory(0));
    expect(evaluateStory(10)).toEqual(evaluateStory(1));
    expect(evaluateStory(NaN)).toEqual(evaluateStory(0));
  });
  it('hides all travelling beans after the hopper has filled', () => {
    for (let i = 0; i < 56; i++) expect(beanFlight(.41, i, 56).visible).toBe(false);
  });
  it('keeps the rising coffee inside the tapered cup', () => {
    let previous = cupSurface(0);
    for (let i = 1; i <= 100; i++) {
      const surface = cupSurface(i / 100);
      expect(surface.height).toBeGreaterThanOrEqual(previous.height);
      expect(surface.radius).toBeGreaterThanOrEqual(previous.radius);
      expect(surface.radius).toBeLessThan(.0381);
      expect(surface.height).toBeLessThanOrEqual(.0796);
      previous = surface;
    }
  });
});
