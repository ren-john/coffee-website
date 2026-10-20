import { clamp, lerp, smooth } from './evaluateStory';

type Point = { x: number; y: number; z: number };
type Subject = Point & { height: number };
export type CameraSubjects = {
  bag: Subject;
  grinder: Subject;
  machine: Subject;
  cup: Subject;
  mouth: Point;
  hopper: Point;
  basket: Point;
  spout: Point;
  liquid: Point;
  finale: Point & { frameHeight: number };
};
type Shot = Point & { at: number; frameHeight: number };

// frameHeight is the visible world-space height at the focus plane. Close-ups
// deliberately show only part of a model, even on wide or portrait displays.
export function cameraStory(raw: number, subjects: CameraSubjects) {
  const p = clamp(Number.isFinite(raw) ? raw : 0);
  const { bag, grinder, machine, cup, mouth, hopper, basket, spout, liquid, finale } = subjects;
  const shot = (at: number, point: Point, frameHeight: number, offsetY = 0): Shot =>
    ({ at, x: point.x, y: point.y + offsetY, z: point.z, frameHeight });
  const shots = [
    shot(0, bag, bag.height * .54, bag.height * .25),
    shot(.11, bag, bag.height * .54, -bag.height * .25),
    shot(.195, mouth, bag.height * .60, -.08),
    shot(.265, mouth, 1.45, -.25),
    shot(.355, hopper, grinder.height * .57, .15),
    shot(.39, hopper, grinder.height * .52, -.12),
    shot(.475, basket, grinder.height * .52, .10),
    shot(.55, basket, machine.height * .73, .12),
    shot(.635, machine, machine.height * .56, machine.height * .24),
    shot(.70, machine, machine.height * .56, machine.height * .04),
    shot(.77, spout, machine.height * .43, -.12),
    shot(.855, liquid, cup.height * .80, -.05),
    shot(.925, finale, finale.frameHeight),
    shot(.975, finale, finale.frameHeight),
    shot(1, finale, finale.frameHeight),
  ];
  const end = shots.findIndex(s => s.at > p);
  const b = shots[end < 0 ? shots.length - 1 : end];
  const a = shots[Math.max(0, (end < 0 ? shots.length - 1 : end) - 1)];
  const t = smooth(p, a.at, b.at);
  return {
    x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), z: lerp(a.z, b.z, t),
    frameHeight: lerp(a.frameHeight, b.frameHeight, t),
  };
}
