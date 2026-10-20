import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { evaluateStory, smooth, phase, lerp, beanFlight, cupSurface } from '../story/evaluateStory';
import { cameraStory } from '../story/cameraStory';
import { fitFinale } from './fitFinale';

type ModelName = 'packaging' | 'bean' | 'grinder' | 'espresso' | 'cup' | 'portafilter';
type Assets = Record<ModelName, THREE.Group>;
const names: ModelName[] = ['packaging', 'bean', 'grinder', 'espresso', 'cup', 'portafilter'];
function named(root: THREE.Object3D, name: string) { let found: THREE.Object3D | undefined; root.traverse(o => { if (o.name === name || o.name === name.replaceAll(' ', '_')) found = o; }); return found; }
function contains(root: THREE.Object3D, value: string) { const list: THREE.Object3D[] = []; root.traverse(o => { if (o.name.toLowerCase().replaceAll('_', ' ').includes(value.toLowerCase())) list.push(o); }); return list; }

export async function createScene(container: HTMLElement, onLoad: (loaded: number) => void, onFailure: (error: unknown) => void) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x2d0000, 0); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.35;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.replaceChildren(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .02, 80);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment(); const environment = pmrem.fromScene(room, .04); room.dispose();
  scene.environment = environment.texture; scene.environmentIntensity = .7;
  scene.add(new THREE.HemisphereLight(0xfff8e9, 0x9c7965, 1.25));
  const key = new THREE.DirectionalLight(0xfff1dd, 3.1); key.position.set(-3, 6, 5); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -6; key.shadow.camera.right = 6; key.shadow.camera.top = 7; key.shadow.camera.bottom = -4; key.shadow.normalBias = .02; key.shadow.bias = -.00015; scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 1); fill.position.set(4, 3, -2); scene.add(fill);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.ShadowMaterial({ color: 0x68483c, opacity: .13 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -.02; floor.receiveShadow = true; scene.add(floor);
  const loader = new GLTFLoader(); let loaded = 0;
  const assets = {} as Assets;
  try {
    await Promise.all(names.map(async name => {
      const result = await loader.loadAsync(`/models/${name}.glb`); assets[name] = result.scene;
      result.scene.traverse(o => { if (o instanceof THREE.Mesh) { o.castShadow = name !== 'bean'; o.receiveShadow = true; } });
      onLoad(++loaded / names.length);
    }));
  } catch (error) { renderer.dispose(); environment.dispose(); pmrem.dispose(); container.replaceChildren(); throw error; }
  const wrap = (name: ModelName, scale: number) => { const group = new THREE.Group(); group.name = name + '-stage'; group.add(assets[name]); group.scale.setScalar(scale); scene.add(group); return group; };
  const bag = wrap('packaging', 7.8); assets.packaging.position.y = -.12;
  const grinder = wrap('grinder', 4); const machine = wrap('espresso', 4); const cup = wrap('cup', 5); const filter = wrap('portafilter', 4);
  // Bounds establish detail-shot anchors, not an instruction to fit the model.
  const bagBounds = new THREE.Box3().setFromObject(bag);
  const bagSize = bagBounds.getSize(new THREE.Vector3());
  const bagLocalCenter = bagBounds.getCenter(new THREE.Vector3()).divideScalar(7.8);
  const grinderSize = new THREE.Box3().setFromObject(grinder).getSize(new THREE.Vector3());
  const machineSize = new THREE.Box3().setFromObject(machine).getSize(new THREE.Vector3());
  const cupBounds = new THREE.Box3().setFromObject(cup);
  const cupSize = cupBounds.getSize(new THREE.Vector3());
  const finaleBagPosition = new THREE.Vector3(-.5, .65, -.35);
  const finaleBagRotation = new THREE.Euler(0, -.18, -.08);
  const finaleCupPosition = new THREE.Vector3(.45, 0, .5);
  const settledBounds = (bounds: THREE.Box3, originalScale: number, position: THREE.Vector3, rotation: THREE.Euler, scale: number) => {
    const local = bounds.clone(); local.min.divideScalar(originalScale); local.max.divideScalar(originalScale);
    return local.applyMatrix4(new THREE.Matrix4().compose(position, new THREE.Quaternion().setFromEuler(rotation), new THREE.Vector3(scale, scale, scale)));
  };
  // Include the entire package, cup handle and saucer in the ending composition.
  const finaleBounds = settledBounds(bagBounds, 7.8, finaleBagPosition, finaleBagRotation, 5.2)
    .union(settledBounds(cupBounds, 5, finaleCupPosition, new THREE.Euler(0, -.35, 0), 10));
  let finaleShot = fitFinale(finaleBounds, camera.aspect, camera.fov);
  const hinge = named(assets.packaging, 'ClosurePivot'); const release = named(assets.packaging, 'BeanRelease');
  const mouths: THREE.Mesh[] = []; assets.packaging.traverse(o => { if (o instanceof THREE.Mesh && o.morphTargetDictionary?.MouthOpen !== undefined) mouths.push(o); });
  const bagAngle = .10;
  const lid = contains(assets.grinder, 'hopper lid');
  const lidPos = lid.map(o => o.position.clone());
  const hopperBeans = contains(assets.grinder, 'beans inside hopper')[0];
  const hopperBase = hopperBeans?.position.clone();
  ['portafilter basket', 'portafilter neck', 'portafilter grip', 'handle end cap', 'dose of ground coffee'].forEach(n => contains(assets.grinder, n).forEach(o => o.visible = false));
  contains(assets.espresso, 'portafilter assembly').forEach(o => o.visible = false);
  contains(assets.espresso, 'filter basket rim').forEach(o => o.visible = false);
  const lever = contains(assets.espresso, 'lever pivot')[0];
  const leverRotation = lever?.rotation.clone();
  const dose = contains(assets.portafilter, 'dose of ground coffee')[0];
  const doseOriginal = dose?.position.clone();
  contains(assets.cup, 'coffee -').forEach(o => o.visible = false);
  const saucer = contains(assets.cup, 'saucer - recessed')[0];

  const coffeeMaterial = new THREE.MeshPhysicalMaterial({ color: 0x2f1007, roughness: .23, metalness: 0, clearcoat: .6, clearcoatRoughness: .15, side: THREE.DoubleSide });
  const coffeeSurface = new THREE.Mesh(new THREE.CircleGeometry(1, 64), coffeeMaterial); coffeeSurface.rotation.x = -Math.PI / 2; assets.cup.add(coffeeSurface);
  const crema = new THREE.Mesh(new THREE.RingGeometry(.94, 1, 64), new THREE.MeshStandardMaterial({ color: 0xc0945d, roughness: .6, side: THREE.DoubleSide })); crema.rotation.x = -Math.PI / 2; assets.cup.add(crema);
  const streams = [-1, 1].map(() => { const mesh = new THREE.Mesh(new THREE.CylinderGeometry(.007, .005, 1, 10), new THREE.MeshPhysicalMaterial({ color: 0x71350e, roughness: .28, clearcoat: .35 })); mesh.castShadow = false; scene.add(mesh); return mesh; });
  const splash = new THREE.Mesh(new THREE.RingGeometry(.045, .047, 48), new THREE.MeshBasicMaterial({ color: 0xcb9863, transparent: true, opacity: .2, side: THREE.DoubleSide, depthWrite: false })); splash.rotation.x = -Math.PI / 2; scene.add(splash);

  let beanSource: THREE.Mesh | undefined; assets.bean.traverse(o => { if (o instanceof THREE.Mesh) beanSource = o; });
  if (!beanSource) throw new Error('Bean geometry missing');
  const beanCount = matchMedia('(max-width:600px)').matches ? 32 : 56;
  const beans = new THREE.InstancedMesh(beanSource.geometry, beanSource.material, beanCount); beans.frustumCulled = false; scene.add(beans);
  const grounds = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.006, 0), new THREE.MeshStandardMaterial({ color: 0x372014, roughness: 1 }), 50); grounds.frustumCulled = false; scene.add(grounds);
  const dummy = new THREE.Object3D(); const v1 = new THREE.Vector3(); const v2 = new THREE.Vector3(); const v3 = new THREE.Vector3(); const up = new THREE.Vector3(0, 1, 0);
  const filterStart = new THREE.Vector3(), filterEnd = new THREE.Vector3(), dock = new THREE.Vector3();
  const beanStart = new THREE.Vector3(), beanEnd = new THREE.Vector3(), chute = new THREE.Vector3(), liquidWorld = new THREE.Vector3();
  const bagFocus = new THREE.Vector3(), grinderFocus = new THREE.Vector3(), machineFocus = new THREE.Vector3(), cupFocus = new THREE.Vector3(), spoutFocus = new THREE.Vector3();
  const grinderRotation = -.28; const machineRotation = .32;
  let p = 0, disposed = false, inView = true, mobile = false, frameCount = 0, started = performance.now();
  let fps = 0; const stats = { frames: 0, fps: 0, drawCalls: 0, triangles: 0, geometries: 0, textures: 0 };
  const resize = () => { const w = container.clientWidth, h = container.clientHeight; mobile = w <= 600; renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.5)); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); finaleShot = fitFinale(finaleBounds, camera.aspect, camera.fov); };
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(container); resize();
  const observer = new IntersectionObserver(entries => inView = entries[0].isIntersecting); observer.observe(container);
  const loseContext = (event: Event) => { event.preventDefault(); onFailure(new Error('WebGL context lost')); };
  renderer.domElement.addEventListener('webglcontextlost', loseContext);

  function render(time: number) {
    if (disposed || document.hidden || !inView) return;
    const s = evaluateStory(p); const final = s.final; const opening = smooth(p, .15, .31); const stageX = 0;
    const travel = 8;
    bag.visible = s.bagVisible; grinder.visible = s.grinderVisible; machine.visible = s.machineVisible; cup.visible = s.cupVisible; filter.visible = p > .30 && p < .95;
    // Separate shared world coordinates keep model anchors and particle paths aligned.
    bag.position.set(lerp(stageX, stageX - .05, opening), lerp(1.22, 3.12, opening) + smooth(p, .36, .415) * 5, 0);
    bag.scale.setScalar(lerp(7.8, 4.7, opening)); bag.rotation.set(0, -.22, lerp(bagAngle, 2.72, s.tilt));
    const idle = 1 - smooth(p, .08, .12);
    if (idle > 0) { bag.position.y += Math.sin(time * .0008) * .025 * idle; bag.rotation.y += Math.sin(time * .0005) * .025 * idle; }
    if (p > .88) { bag.position.copy(finaleBagPosition); bag.position.y = lerp(6, finaleBagPosition.y, final); bag.scale.setScalar(5.2); bag.rotation.copy(finaleBagRotation); }
    mouths.forEach(o => { o.morphTargetInfluences![o.morphTargetDictionary!.MouthOpen] = s.mouth; });
    if (hinge) { hinge.rotation.x = s.mouth * -1.65; hinge.position.x = s.mouth * .003; }
    grinder.position.set(stageX + smooth(p, .51, .60) * travel, lerp(-4.5, 0, smooth(p, .23, .315)), 0); grinder.rotation.y = grinderRotation;
    machine.position.set(stageX + (1 - smooth(p, .515, .63)) * travel + final * travel, 0, -.04); machine.rotation.y = machineRotation;
    const lidOpen = smooth(p, .245, .30) * (1 - smooth(p, .405, .455));
    lid.forEach((o, i) => { o.position.copy(lidPos[i]); o.position.x += lidOpen * .12; o.position.y += lidOpen * .035; o.rotation.z = -lidOpen * .25; });
    if (hopperBeans && hopperBase) { hopperBeans.visible = s.hopperFill > .01; hopperBeans.scale.y = Math.max(.01, s.hopperFill); hopperBeans.position.copy(hopperBase); hopperBeans.position.y += .346 * (1 - hopperBeans.scale.y); }
    if (lever && leverRotation) { lever.rotation.copy(leverRotation); lever.rotation.x += s.lever * .72; }
    scene.updateMatrixWorld(true);
    grinder.localToWorld(filterStart.set(0, .13, .105));
    machine.localToWorld(filterEnd.set(0, .332, .052));
    // Anchors use settled machinery positions during the handoff, not its exit/entry translation.
    filterStart.x -= smooth(p, .51, .60) * travel;
    filterEnd.x -= (1 - smooth(p, .515, .63)) * travel;
    filter.position.lerpVectors(filterStart, filterEnd, s.transfer); filter.position.y += Math.sin(s.transfer * Math.PI) * .5;
    filter.rotation.y = lerp(grinderRotation, machineRotation, s.transfer) + Math.sin(s.transfer * Math.PI) * .35;
    if (dose && doseOriginal) { dose.visible = s.groundsFill > .01; dose.scale.y = Math.max(.001, s.groundsFill); dose.position.copy(doseOriginal); dose.position.y += .149 * (1 - dose.scale.y); }

    machine.localToWorld(dock.set(0, .075, .078)); dock.x -= final * travel;
    cup.position.copy(dock); cup.position.x += (1 - s.cupArrival) * 2.5;
    cup.rotation.y = -.35; cup.scale.setScalar(lerp(5, 10, final));
    cup.position.lerp(finaleCupPosition, final);
    if (saucer) saucer.visible = final > .12;
    const liquid = cupSurface(s.cupFill);
    coffeeSurface.visible = s.cupFill > .001; coffeeSurface.position.y = liquid.height; coffeeSurface.scale.setScalar(liquid.radius);
    crema.visible = s.cupFill > .1; crema.position.y = liquid.height + .00012; crema.scale.setScalar(liquid.radius);
    scene.updateMatrixWorld(true);

    grinder.localToWorld(beanEnd.set(0, .405, 0));
    if (release) release.getWorldPosition(beanStart); else beanStart.set(stageX, 2.6, 0);
    beans.visible = s.beansVisible;
    if (beans.visible) for (let i = 0; i < beanCount; i++) {
      const flight = beanFlight(p, i, beanCount); const t = flight.t; const a = i * 2.39996;
      dummy.position.lerpVectors(beanStart, beanEnd, t * t);
      dummy.position.x += Math.sin(a) * .18 * Math.sin(Math.PI * t); dummy.position.z += Math.cos(a) * .15 * Math.sin(Math.PI * t);
      dummy.rotation.set(i + t * 6, a + t * 4, i * .7 + t * 2);
      // Follow the pouch scale as the camera pulls back for the hopper handoff.
      dummy.scale.setScalar(flight.visible ? (8 + (i % 4)) * bag.scale.x / 4.7 : 0); dummy.updateMatrix(); beans.setMatrixAt(i, dummy.matrix);
    }
    if (beans.visible) beans.instanceMatrix.needsUpdate = true;
    grounds.visible = p > .405 && p < .49;
    grinder.localToWorld(chute.set(0, .178, .075));
    if (grounds.visible) for (let i = 0; i < 50; i++) {
      const t = (phase(p, .405, .49) * 3 + i / 50) % 1;
      dummy.position.lerpVectors(chute, filterStart, t); dummy.position.x += Math.sin(i * 43) * .035; dummy.position.z += Math.cos(i * 17) * .035;
      dummy.rotation.set(i, i, i); dummy.scale.setScalar(.6 + (i % 3) * .2); dummy.updateMatrix(); grounds.setMatrixAt(i, dummy.matrix);
    }
    if (grounds.visible) grounds.instanceMatrix.needsUpdate = true;
    cup.localToWorld(liquidWorld.set(0, liquid.height, 0));
    streams.forEach((mesh, i) => {
      const from = machine.localToWorld(v1.set(i ? .013 : -.013, .313, .061));
      const to = v3.copy(from); to.y = liquidWorld.y;
      v2.subVectors(to, from); const length = v2.length();
      mesh.visible = s.stream > .001; mesh.position.copy(from).addScaledVector(v2, .5 * s.stream);
      mesh.quaternion.setFromUnitVectors(up, v2.normalize()); mesh.scale.set(s.stream, length * s.stream, s.stream);
    });
    splash.visible = s.stream > .5 && s.cupFill > .01; splash.position.copy(machine.localToWorld(v1.set(0, 0, .061))); splash.position.y = liquidWorld.y + .005;
    splash.scale.setScalar(1 + .2 * Math.sin(time * .004));

    // Travel through the objects: a viewport-sized window onto oversized models.
    bag.localToWorld(bagFocus.copy(bagLocalCenter));
    grinder.localToWorld(grinderFocus.set(0, grinderSize.y / 8, 0));
    machine.localToWorld(machineFocus.set(0, machineSize.y / 8, 0));
    cup.localToWorld(cupFocus.set(0, cupSize.y / 10, 0));
    machine.localToWorld(spoutFocus.set(0, .313, .061));
    const shot = cameraStory(p, {
      bag: { ...bagFocus, height: bagSize.y * bag.scale.x / 7.8 },
      grinder: { ...grinderFocus, height: grinderSize.y },
      machine: { ...machineFocus, height: machineSize.y },
      cup: { ...cupFocus, height: cupSize.y * cup.scale.x / 5 },
      mouth: beanStart, hopper: beanEnd, basket: filter.position, spout: spoutFocus, liquid: liquidWorld,
      finale: finaleShot,
    });
    const distance = shot.frameHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.position.set(shot.x, shot.y + distance * .18, shot.z + distance);
    camera.lookAt(v3.set(shot.x, shot.y, shot.z));
    camera.updateProjectionMatrix(); renderer.render(scene, camera);
    frameCount++; const now = performance.now(); const reportStats = now - started > 1000;
    if (reportStats) { fps = frameCount * 1000 / (now - started); frameCount = 0; started = now; }
    Object.assign(stats, { frames: stats.frames + 1, fps: Math.round(fps), drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures });
    if (reportStats) { container.dataset.fps = String(stats.fps); container.dataset.triangles = String(stats.triangles); container.dataset.drawCalls = String(stats.drawCalls); }
  }
  renderer.setAnimationLoop(render);
  return {
    setProgress(value: number) { p = value; },
    stats,
    dispose() {
      disposed = true; renderer.setAnimationLoop(null); resizeObserver.disconnect(); observer.disconnect(); renderer.domElement.removeEventListener('webglcontextlost', loseContext);
      const geometries = new Set<THREE.BufferGeometry>(); const materials = new Set<THREE.Material>(); const textures = new Set<THREE.Texture>();
      scene.traverse(o => { if (o instanceof THREE.Mesh) { geometries.add(o.geometry); (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => materials.add(m)); } });
      materials.forEach(m => { Object.values(m).forEach(v => { if (v instanceof THREE.Texture) textures.add(v); }); m.dispose(); });
      geometries.forEach(g => g.dispose()); textures.forEach(t => t.dispose()); environment.dispose(); pmrem.dispose(); renderer.dispose(); container.replaceChildren();
    },
  };
}
