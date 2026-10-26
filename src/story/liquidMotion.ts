import { phase, smooth } from './evaluateStory';

// Fine motion continues between scroll events; the brew envelope still comes
// from scroll progress, so seeking/reversing never leaves coffee flowing.
export function liquidMotion(p: number, seconds: number, channel = 0) {
  const envelope = smooth(p, .705, .72) * (1 - smooth(p, .87, .88));
  const cycle = ((seconds + channel * .61) % 2.4) / 2.4;
  const breakUp = smooth(cycle, .63, .72) * (1 - smooth(cycle, .89, .99));
  const continuous = smooth(p, .728, .75) * (1 - smooth(p, .84, .858));
  return {
    ribbon: envelope * continuous * (1 - breakUp),
    drops: envelope * (1 - continuous * (1 - breakUp)),
    active: envelope > .001,
  };
}

export function dropFlight(seconds: number, index: number, channel: number) {
  const cycle = ((seconds * 1.45 + index * .29 + channel * .41) % 1 + 1) % 1;
  return { t: phase(cycle, .16, .88), visible: cycle >= .16 && cycle < .88 };
}
