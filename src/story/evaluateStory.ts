export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export function phase(p: number, a: number, b: number) { return clamp((p - a) / (b - a)); }
export function smooth(p: number, a: number, b: number) { const t = phase(p, a, b); return t * t * (3 - 2 * t); }
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export function evaluateStory(raw: number) {
  const p = clamp(Number.isFinite(raw) ? raw : 0);
  const chapter = p < .12 ? 0 : p < .30 ? 1 : p < .49 ? 2 : p < .66 ? 3 : p < .88 ? 4 : 5;
  return {
    p, chapter,
    mouth: smooth(p, .13, .22) * (1 - smooth(p, .88, .94)),
    tilt: smooth(p, .19, .30),
    hopperFill: smooth(p, .29, .405) * (1 - smooth(p, .415, .485)),
    groundsFill: smooth(p, .405, .49),
    transfer: smooth(p, .49, .635),
    lever: smooth(p, .665, .765),
    cupArrival: smooth(p, .64, .70),
    cupFill: smooth(p, .725, .87),
    stream: smooth(p, .705, .73) * (1 - smooth(p, .855, .88)),
    final: smooth(p, .88, .975),
    bagVisible: p < .415 || p > .88,
    grinderVisible: p > .23 && p < .60,
    machineVisible: p > .515 && p < .975,
    cupVisible: p > .64,
    beansVisible: p > .235 && p < .41,
  };
}
export function beanFlight(p: number, index: number, count: number) {
  const start = .238 + index / count * .105;
  return { t: phase(p, start, start + .063), visible: p >= start && p <= start + .063 };
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
