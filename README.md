# Mr. Bean — Your Favorite Brew, Made at Home.

A local Vite + TypeScript + Three.js + GSAP coffee landing page. The scroll story opens the packaging, follows beans into the grinder, transfers the filled portafilter into the espresso machine, pours into the cup, and ends with the headline and Shop Now button.

## Run locally

Requires Node.js 24 (tested with 24.13.0) and npm. From this folder in PowerShell:

```powershell
npm.cmd ci
npm.cmd run dev
```

Open the localhost URL printed by Vite, normally **http://127.0.0.1:5173/**. Stop the server with Ctrl+C. Dependencies are already installed in the current workspace; `npm.cmd ci` is for a clean installation.

For a local production build:

```powershell
npm.cmd run build
npm.cmd run preview
```

The preview normally runs at **http://127.0.0.1:4173/**. Do not open `index.html` directly from the filesystem. Both servers bind to loopback, not the LAN. No hosting, cloud service or account is required.

## Included

- Six scroll chapters with clickable chapter navigation and a skip-to-shop link.
- A white background with burgundy type and cream packaging. The opening composition follows `sequence/`: copy on the left and the package pouring from the right.
- Oversized, cropped models revealed by a scrolling camera: packaging top to bottom, mouth to falling beans, hopper to grinder outlet, machine lever to spout, then the cup's rim and body. Detail shots intentionally do not fit the whole model, including on mobile. Beans inherit the pouch's scale during release.
- The final headline is the exception: the camera pulls back to fit the complete package and cup together, including the handle and saucer, with a margin. Framing uses their combined bounds and adjusts to the viewport aspect ratio.
- A longer scroll sequence (1800vh desktop / 1600vh mobile) and 1.25-second scroll interpolation keep the copy and animation synchronized between scroll events. Hidden particle buffers are not updated.
- All five custom 3D models, plus a shared portafilter for the handoff.
- Openable packaging with two mouth morph targets and a separate closure pivot.
- Instanced falling beans and a dense, growing hopper pile. The camera holds on the hopper through the last arrivals and a full-pile pause, then descends to the grounds outlet.
- Flexible espresso streams with intermittent individual drops, expanding impact ripples and a gently moving coffee surface that settles after extraction.
- Cream/burgundy styling and locally bundled Newsreader / Source Sans 3 fonts.
- Four prototype coffees with size/grind selectors, size-dependent prices, and a browser-local shopping bag with quantity/remove controls.
- A static narrative for reduced motion, and poster fallback/retry if 3D fails. No orders or payments are processed.

Everything required at runtime is served locally. Internet is needed only for a fresh dependency installation. Original model sources and reference images remain under `Assets/`; only runtime exports and posters are in `public/`.

## Main editing points

| File | Purpose |
| --- | --- |
| `index.html` | Story copy, header, collection, final message, cart dialog |
| `src/styles.css` | Palette, typography, layout and responsive rules |
| `src/story/evaluateStory.ts` | Scene boundaries and deterministic animation progress |
| `src/story/cameraStory.ts` | Scroll-driven close-up camera targets and framing |
| `src/story/liquidMotion.ts` | Flow pulses, individual drops and extraction envelope |
| `src/scene/createScene.ts` | Models, lighting, camera framing and 3D choreography |
| `src/main.ts` | ScrollTrigger, loading, reduced-motion switching, DOM chapter state |
| `src/data/products.ts` | Prototype coffee names, prices, sizes and grind options |
| `src/ui/shop.ts` | Local shopping bag and catalog controls |
| `Assets/Models/scripts/prepare_story_assets.py` | Regenerate opening pouch, lightweight bean and transferable portafilter |
| `plan.md` | Original design/implementation plan and current completion status |

The original models are not overwritten by animation preparation. Editable derivatives are stored in `Assets/Models/AnimationReady/`.

## Checks

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

Tests cover forward/backward determinism, boundary states, pouring order, cup fill limits and the actual runtime GLBs' animation controls and embedded resources. The test runner requires permission to spawn worker processes on Windows.

## Verification limitation

Type checking, automated tests and the production build have been run. Browser automation rejected access to the localhost preview, so visual scene framing, responsive appearance, keyboard interactions and real FPS/memory measurements still require a browser review. This is not a claim of completed visual QA.

To review manually, use the six scene buttons at the bottom of the stage, scroll forward and backward, resize the window, and try the shopping bag. Suggested widths: 1440, 768, 390 and 360 pixels. Enable reduced motion in the operating system to check the static version. The scene container exposes `data-fps`, `data-triangles` and `data-draw-calls` for local development inspection.

The prototype product values came from the supplied storefront concept and remain editable; they are not connected to live inventory.
