import { describe, expect, it } from 'vitest';
import { Box3, PerspectiveCamera, Vector3 } from 'three';
import { fitFinale } from '../src/scene/fitFinale';
import { cameraStory, type CameraSubjects } from '../src/story/cameraStory';

const subjects: CameraSubjects = {
  bag: { x: 0, y: 1.2, z: 0, height: 2 },
  grinder: { x: 0, y: 1, z: 0, height: 2 },
  machine: { x: 0, y: 1.5, z: 0, height: 3 },
  cup: { x: .45, y: .5, z: .5, height: 1 },
  mouth: { x: 0, y: 2.2, z: 0 },
  hopper: { x: 0, y: 1.8, z: 0 },
  basket: { x: 0, y: .5, z: .4 },
  spout: { x: 0, y: 1.2, z: .3 },
  liquid: { x: .45, y: .9, z: .5 },
  finale: { x: 0, y: 1, z: .2, frameHeight: 3.5 },
};

describe('scroll-driven detail camera', () => {
  it.each([16 / 9, 390 / 844])('reveals the top then bottom of the cropped bag at aspect %s', aspect => {
    const project = (p: number, y: number) => {
      const s = cameraStory(p, subjects);
      const distance = s.frameHeight / (2 * Math.tan(34 * Math.PI / 360));
      const camera = new PerspectiveCamera(34, aspect, .02, 80);
      camera.position.set(s.x, s.y + distance * .18, s.z + distance);
      camera.lookAt(s.x, s.y, s.z); camera.updateMatrixWorld();
      return new Vector3(0, y, 0).project(camera).y;
    };
    const top = subjects.bag.y + subjects.bag.height / 2;
    const bottom = subjects.bag.y - subjects.bag.height / 2;
    expect(Math.abs(project(0, top))).toBeLessThan(1);
    expect(project(0, bottom)).toBeLessThan(-1);
    expect(project(.11, top)).toBeGreaterThan(1);
    expect(Math.abs(project(.11, bottom))).toBeLessThan(1);
  });

  it('keeps detail shots tighter than each complete model', () => {
    for (const [p, subject] of [[0, subjects.bag], [.39, subjects.grinder], [.635, subjects.machine]] as const) {
      expect(cameraStory(p, subjects).frameHeight).toBeLessThan(subject.height * .85);
    }
  });

  it('holds the hopper shot through the final arrivals before descending to the outlet', () => {
    const filling = cameraStory(.35, subjects);
    expect(cameraStory(.385, subjects)).toEqual(filling);
    expect(cameraStory(.435, subjects)).toEqual(filling);
    expect(cameraStory(.485, subjects).y).toBeLessThan(filling.y);
    expect(cameraStory(0, subjects, 16 / 9).x).toBeLessThan(subjects.bag.x);
  });

  it.each([1920 / 945, 16 / 9, 768 / 1024, 390 / 844])('fits both final products with a margin at aspect %s', aspect => {
    const bounds = new Box3(new Vector3(-1.1, -.05, -.65), new Vector3(1.6, 2, 1.45));
    const finale = fitFinale(bounds, aspect);
    const shot = cameraStory(1, { ...subjects, finale });
    const distance = shot.frameHeight / (2 * Math.tan(34 * Math.PI / 360));
    const camera = new PerspectiveCamera(34, aspect, .02, 80);
    camera.position.set(shot.x, shot.y + distance * .18, shot.z + distance);
    camera.lookAt(shot.x, shot.y, shot.z); camera.updateMatrixWorld();
    for (const x of [bounds.min.x, bounds.max.x]) {
      for (const y of [bounds.min.y, bounds.max.y]) {
        for (const z of [bounds.min.z, bounds.max.z]) {
          const projected = new Vector3(x, y, z).project(camera);
          expect(Math.abs(projected.x)).toBeLessThanOrEqual(.780001);
          expect(Math.abs(projected.y)).toBeLessThanOrEqual(.780001);
          expect(projected.z).toBeGreaterThan(-1);
          expect(projected.z).toBeLessThan(1);
        }
      }
    }
  });

  it('has no jumps between camera beats, including reverse scrolling', () => {
    for (let i = 1; i <= 1000; i++) {
      const p = i / 1000;
      const before = cameraStory(p - .000001, subjects), after = cameraStory(p, subjects);
      for (const key of ['x', 'y', 'z', 'frameHeight'] as const) {
        expect(Number.isFinite(after[key])).toBe(true);
        expect(Math.abs(after[key] - before[key])).toBeLessThan(.001);
      }
      expect(after.frameHeight).toBeGreaterThan(0);
    }
    const samples = [0, .11, .265, .475, .635, .855, 1];
    expect(samples.map(p => cameraStory(p, subjects))).toEqual([...samples].reverse().map(p => cameraStory(p, subjects)).reverse());
  });
});
