import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

type GLB = {
  nodes: { name?: string; mesh?: number }[];
  meshes: { extras?: { targetNames?: string[] }; primitives: { indices: number; targets?: unknown[] }[] }[];
  accessors: { count: number }[];
  buffers: { uri?: string }[];
  images?: { uri?: string; bufferView?: number }[];
};
function read(name: string): GLB {
  const buffer = readFileSync(new URL(`../public/models/${name}.glb`, import.meta.url));
  expect(buffer.toString('ascii', 0, 4)).toBe('glTF');
  expect(buffer.readUInt32LE(4)).toBe(2);
  expect(buffer.readUInt32LE(8)).toBe(buffer.length);
  return JSON.parse(buffer.toString('utf8', 20, 20 + buffer.readUInt32LE(12)));
}
const names = (asset: GLB) => asset.nodes.map(n => n.name);

describe('runtime model contracts', () => {
  it('ships all six assets without remote resource dependencies', () => {
    for (const name of ['packaging', 'bean', 'grinder', 'espresso', 'cup', 'portafilter']) {
      const asset = read(name);
      expect(asset.buffers.every(b => !b.uri)).toBe(true);
      expect((asset.images ?? []).every(i => !i.uri && i.bufferView !== undefined)).toBe(true);
    }
  });
  it('exports both mouth morph targets and the release/closure controls', () => {
    const asset = read('packaging');
    expect(names(asset)).toContain('ClosurePivot');
    expect(names(asset)).toContain('BeanRelease');
    const mouths = asset.meshes.filter(m => m.extras?.targetNames?.includes('MouthOpen'));
    expect(mouths).toHaveLength(2);
    mouths.forEach(m => expect(m.primitives[0].targets?.length).toBeGreaterThan(0));
  });
  it('keeps the instanced bean lightweight', () => {
    const asset = read('bean');
    const triangles = asset.meshes.flatMap(m => m.primitives).reduce((n, p) => n + asset.accessors[p.indices].count / 3, 0);
    expect(triangles).toBeLessThan(1500);
    expect(triangles).toBeGreaterThan(100);
  });
  it('contains the movable grinder lid, fill mesh and transferable basket', () => {
    expect(names(read('grinder'))).toEqual(expect.arrayContaining(['Hopper lid', 'Beans inside hopper']));
    expect(names(read('portafilter'))).toEqual(expect.arrayContaining(['Portafilter basket', 'Portafilter grip', 'Dose of ground coffee']));
  });
  it('preserves the machine lever and removable cup contents', () => {
    expect(names(read('espresso'))).toContain('Lever pivot - animate local X');
    expect(names(read('cup'))).toEqual(expect.arrayContaining(['Coffee - removable liquid surface', 'Coffee - delicate crema edge', 'Saucer - recessed well and raised rim']));
  });
});
