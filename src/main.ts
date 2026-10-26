import './styles.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { evaluateStory } from './story/evaluateStory';
import { setupShop } from './ui/shop';

gsap.registerPlugin(ScrollTrigger);
setupShop();
document.querySelector('#year')!.textContent = String(new Date().getFullYear());
const story = document.querySelector<HTMLElement>('#story')!;
const scene = document.querySelector<HTMLElement>('#scene')!;
const poster = document.querySelector<HTMLImageElement>('#scene-poster')!;
const loading = document.querySelector<HTMLElement>('#scene-loading')!;
const retry = document.querySelector<HTMLButtonElement>('#retry-scene')!;
const chapters = [...document.querySelectorAll<HTMLElement>('.chapter')];
const navButtons = [...document.querySelectorAll<HTMLButtonElement>('.chapters-nav button')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const posters = ['/images/packaging.png', '/images/bean.png', '/images/grinder.png', '/images/espresso.png', '/images/cup.png', '/images/cup.png'];
let engine: { setProgress: (value: number) => void; dispose: () => void } | undefined;
let tween: gsap.core.Tween | undefined;
let current = -1, currentProgress = 0, ready = false, generation = 0;

function update(progress: number) {
  currentProgress = progress; engine?.setProgress(progress);
  const { chapter } = evaluateStory(progress);
  document.documentElement.dataset.chapter = String(chapter);
  story.dataset.progress = progress.toFixed(4);
  document.querySelector<HTMLElement>('#story-progress')!.style.transform = `scaleX(${progress})`;
  document.querySelector<HTMLElement>('#object-note')!.style.opacity = chapter === 0 ? '1' : '0';
  if (chapter !== current) {
    current = chapter;
    chapters.forEach((element, i) => { element.classList.toggle('is-active', i === chapter); element.setAttribute('aria-hidden', String(i !== chapter)); element.inert = i !== chapter; });
    navButtons.forEach((button, i) => { button.classList.toggle('is-current', i === chapter); if (i === chapter) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current'); });
    document.querySelector('#scroll-label')!.textContent = chapter === 5 ? 'MAKE IT YOUR MORNING' : 'SCROLL TO SAVOR';
  }
  if (!ready && poster.getAttribute('src') !== posters[chapter]) poster.src = posters[chapter];
}
function jump(p: number) { window.scrollTo({ top: story.offsetTop + (story.offsetHeight - window.innerHeight) * p, behavior: reducedMotion.matches ? 'instant' : 'smooth' }); }
document.querySelectorAll<HTMLButtonElement>('[data-jump]').forEach(button => button.addEventListener('click', () => jump(Number(button.dataset.jump))));
document.querySelectorAll<HTMLAnchorElement>('a[href="#shop"]').forEach(link => link.addEventListener('click', () => {
  // Focus without cancelling native hash navigation/scrolling.
  window.setTimeout(() => document.querySelector<HTMLElement>('#shop-heading')!.focus({ preventScroll: true }), reducedMotion.matches ? 0 : 650);
}));
function failure(error: unknown) {
  console.warn('3D unavailable; using local scene posters.', error);
  engine?.dispose(); engine = undefined; ready = false; scene.dataset.ready = 'fallback';
  poster.classList.remove('is-hidden'); loading.classList.remove('is-hidden');
  document.querySelector('#loading-label')!.textContent = 'From bean to cup, in stills. Scroll to explore.';
  loading.querySelector('.loading-dot')?.classList.remove('loading-dot'); retry.hidden = false; update(currentProgress);
}
async function startScene() {
  const token = ++generation; engine?.dispose(); engine = undefined; ready = false;
  retry.hidden = true; loading.classList.remove('is-hidden'); poster.classList.remove('is-hidden'); scene.dataset.ready = 'loading';
  try {
    const { createScene } = await import('./scene/createScene');
    if (token !== generation || reducedMotion.matches) return;
    const next = await createScene(scene, value => { document.querySelector('#loading-label')!.textContent = `Preparing your morning · ${Math.round(value * 100)}%`; }, failure);
    if (token !== generation || reducedMotion.matches) { next.dispose(); return; }
    engine = next; engine.setProgress(currentProgress); ready = true; scene.dataset.ready = 'true';
    loading.classList.add('is-hidden'); poster.classList.add('is-hidden');
  } catch (error) { if (token === generation) failure(error); }
}
function setupMotion() {
  tween?.scrollTrigger?.kill(); tween?.kill(); tween = undefined;
  if (reducedMotion.matches) {
    generation++; engine?.dispose(); engine = undefined; ready = false; story.hidden = true;
    document.querySelector<HTMLElement>('#reduced-story')!.hidden = false;
    return;
  }
  story.hidden = false; document.querySelector<HTMLElement>('#reduced-story')!.hidden = true;
  const driver = { value: 0 };
  // One shared, interpolated timeline keeps the copy and WebGL scene in sync,
  // including the settling frames after a wheel/touch event has ended.
  tween = gsap.to(driver, { value: 1, ease: 'none', scrollTrigger: { trigger: story, start: 'top top', end: 'bottom bottom', scrub: 1.25, invalidateOnRefresh: true }, onUpdate: () => update(driver.value) });
  update(0); void startScene();
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}
retry.addEventListener('click', () => void startScene());
reducedMotion.addEventListener('change', setupMotion);
setupMotion();
if (import.meta.hot) import.meta.hot.dispose(() => { generation++; engine?.dispose(); tween?.scrollTrigger?.kill(); tween?.kill(); reducedMotion.removeEventListener('change', setupMotion); });
