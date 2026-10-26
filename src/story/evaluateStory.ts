export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export function phase(p: number, a: number, b: number) { return clamp((p - a) / (b - a)); }
export function smooth(p: number, a: number, b: number) { const t = phase(p, a, b); return t * t * (3 - 2 * t); }
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export function evaluateStory(raw: number) {
  const p = clamp(Number.isFinite(raw) ? raw : 0);
  const chapter = p < .12 ? 0 : p < .30 ? 1 : p < .525 ? 2 : p < .66 ? 3 : p < .88 ? 4 : 5;
  return {
    p, chapter,
    mouth: smooth(p, .13, .22) * (1 - smooth(p, .88, .94)),
    tilt: smooth(p, .16, .245),
    hopperFill: phase(p, .28, .385) * (1 - smooth(p, .455, .525)),
    groundsFill: smooth(p, .455, .525),
    transfer: smooth(p, .525, .65),
    lever: smooth(p, .665, .765),
    cupArrival: smooth(p, .64, .70),
    cupFill: smooth(p, .725, .87),
    stream: smooth(p, .705, .73) * (1 - smooth(p, .855, .88)),
    final: smooth(p, .88, .975),
    bagVisible: p < .435 || p > .88,
    grinderVisible: p > .17 && p < .63,
    machineVisible: p > .54 && p < .975,
    cupVisible: p > .64,
    beansVisible: p >= .235 && p <= .385,
  };
}
export function beanFlight(p: number, index: number, count: number) {
  const start = .235 + index / Math.max(1, count - 1) * .105;
  return { t: phase(p, start, start + .045), visible: p >= start && p < start + .045 };
}
export function cupSurface(fill: number) {
  // Piecewise radii follow the actual inner profile of the supplied cup.
  const height = lerp(.026, .0796, clamp(fill));
  const profile = [[.019, .019], [.024, .026], [.033, .0305], [.045, .034], [.058, .0362], [.073, .0376], [.0845, .0381]];
  let radius = .025;
  for (let i = 0; i < profile.length - 1; i++) {
    const [a, ar] = profile[i], [b, br] = profile[i + 1];
    if (height >= a && height <= b) radius = lerp(ar, br, phase(height, a, b)) - .0007;
  }
  return { height, radius };
}
