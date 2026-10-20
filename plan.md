# Mr. Bean — local 3D coffee landing page

Status: implemented locally after the user's instruction to proceed. See the completion update below; visual browser QA remains pending.

Prepared: 14 October 2026. Workspace: `C:\RJ\Coding\cofeewebsite`.

### Implementation update

- Created the Vite / TypeScript / Three.js / GSAP site and local runtime asset derivatives.
- Implemented all six scroll chapters, opening mouth, instanced beans, dosing and portafilter transfer, lever motion, coffee streams and cup fill.
- Added the final required headline, Shop Now destination, prototype catalog, selectors and browser-local shopping bag.
- Added reduced-motion content, poster fallback, local fonts and resource cleanup.
- The original model sources remain intact. The live file organization is documented in `README.md`; related scene functions are grouped in `createScene.ts` rather than split into every module suggested below.
- TypeScript checks and a local production build pass. Automated story and asset-contract tests are included.
- Browser tooling rejected access to the local preview. Visual framing, responsive interaction checks and actual FPS/memory measurements are not verified. Phase F is therefore only partially complete.
- No site has been published or deployed. The remainder of this document records the original plan; future-tense setup instructions have now been carried out where noted above.

## 1. Goal and scope

Build a polished, locally running coffee storefront introduction. Its main experience is one continuous, scroll-controlled journey through the five existing 3D models:

**Packaging → falling beans → grinder → espresso machine → filled coffee cup.**

End with this exact message:

> Your Favorite Brew, Made at Home.

Follow it with a clearly visible **Shop Now** button.

The style should combine the original HTML's warm coffee identity with the coordinated camera movement and 3D storytelling requested by the user. Create an original composition inspired by Lusion's approach.

### Local-only boundary

- Run on this computer through a localhost development or preview server.
- Do not register a Site, deploy, publish, create cloud resources, or add remote analytics.
- No database, authentication, API keys, payment provider, or real order processing is needed.
- Use locally served models, fonts, images, scripts, and lighting resources. No runtime CDN dependencies.
- Installing npm packages or obtaining font files may require internet once; the finished local build should work without internet while its local server is running.
- Keep the existing `.blend` sources, model exports, textures, reference photos, and generation scripts intact. Create animation-ready derivatives separately.
- The user subsequently authorized implementation with “Proceed.” Continue to keep the application local-only.

## 2. Proposed technology stack

| Layer | Choice | Purpose |
| --- | --- | --- |
| Development and build | Vite + npm | Local server, TypeScript modules, fast reload, static build |
| Application code | TypeScript | Typed scene references, animation state, asset manifest, UI behavior |
| 3D rendering | Three.js, using WebGLRenderer | Render the GLBs, materials, cameras, lighting, instances and pouring effects |
| Model loading | Three.js GLTFLoader | Load the existing GLBs and access named parts |
| Scroll choreography | GSAP + ScrollTrigger | Map native page scrolling to a reversible animation timeline |
| Page UI | Semantic HTML + plain CSS | Accessible headings, navigation, progress, buttons and product cards |
| Model preparation | Installed Blender 5.2 + existing Python scripts | Opening pouch, pivots, simplified beans, export corrections |
| Verification | TypeScript check, Vite build, focused Vitest tests, browser QA | Verify deterministic story behavior and the actual local experience |

Use a vanilla TypeScript Vite project. React and React Three Fiber are unnecessary for the current single-page scope; the scene and DOM are small enough to organize directly in modules. This can be reconsidered if the project later becomes a larger application.

Planned runtime dependencies: `three`, `gsap`.

Planned development dependencies: `vite`, `typescript`, `@types/three`, `vitest`. Browser automation is optional and should use available browser tooling; add Playwright only if it is needed and supported by the local environment.

Select compatible stable versions at implementation time and commit an npm lockfile. Do not adopt alpha renderers or WebGPU for this first version. Use native scrolling; do not add a second scrolling library such as Lenis initially.

### Available tools, checked locally

- Node.js: `v24.13.0`.
- npm: `11.6.2`; use `npm.cmd` if PowerShell execution policy blocks `npm.ps1`.
- Blender: `C:\Program Files\Blender Foundation\Blender 5.2\blender.exe`.
- Python, Pillow and NumPy were used successfully to create the existing models.
- No website `package.json`, entry page, or application source exists yet.

## 3. Visual direction

- Brand: Mr. Bean, continuing the supplied HTML and packaging artwork.
- Main background: warm cream `#FFF9EF`.
- Main accent: burgundy `#480817`; secondary burgundy `#651F2B`.
- Supporting colors: espresso brown `#371B07`, pale warm surfaces `#F9F3EA`, dark text `#1D1B16`.
- Typography: Newsreader for prominent headings and Source Sans 3 for interface/body text, matching the original HTML. Obtain licensed local font files with license notices. Use Georgia and a system sans-serif as fallbacks.
- Keep the grinder's steel/acrylic and the espresso machine's charcoal/walnut materials. Lighting and background will connect them to the packaging and cup.
- Use warm studio lighting, soft contact shadows, generous empty space, and short supporting phrases.
- Keep important text in HTML outside the canvas. It must remain crisp, selectable and accessible.
- Avoid heavy post-processing initially. Prioritize readable packaging, attractive metal reflections and clear coffee movement.

The supplied HTML remains a visual/content reference, not a production application. Its remote images, CDN Tailwind script, hardcoded cart count, placeholder links and unverified promotional claims should not be copied into working UI without review.

Original pasted reference currently resides at `C:\Users\RJ\.codex\attachments\fa2c3a3f-3226-4ebd-bc99-79da874d27a7\Pasted text.txt`. During implementation, preserve a project-local reference copy if still available; do not make runtime code depend on the attachment directory.

## 4. Storyboard and initial scroll allocation

Percentages below are provisional ranges of the story's normalized progress, not seconds. Tune them in the browser after the full sequence works.

| Progress | Scene | Visible action | Camera/text direction |
| --- | --- | --- | --- |
| 0–12% | Packaging introduction | Closed pouch is the sole hero object; optional very subtle idle movement | Front three-quarter view; “Every great morning starts here.” |
| 12–30% | Packaging opens | Closure unfolds, mouth opens, pouch tilts and releases beans | Follow the falling beans while retaining spatial continuity; “Good things are inside.” |
| 30–49% | Grinder | Hopper lid moves aside; beans land in the hopper; grinder doses grounds into the portafilter | Reveal the grinder below the falling beans; “Freshly ground. Full of possibility.” |
| 49–66% | Espresso preparation | Filled portafilter leaves the grinder, moves to the machine and locks into its brew group | Transition with the portafilter; “A little pressure. Something extraordinary.” |
| 66–86% | Extraction and pouring | Cup moves beneath the spout; lever lowers; espresso streams into the cup and its surface rises | Frame the stream and cup together; prevent clipping through the rim |
| 86–100% | Final reveal | Stream stops, coffee settles, cup and packaging form the final composition | Reveal “Your Favorite Brew, Made at Home.” and **Shop Now**; keep both visible as the story ends |

Supporting copy is a proposed default. Only the final headline and Shop Now label are fixed user requirements.

### Story continuity

- Show the same visual bean stream leaving the packaging and entering the hopper; avoid cuts to unrelated static models.
- Beans become grounds in the grinder. Do not show whole beans entering the espresso machine.
- Move one visible portafilter between the grinder and machine. Hide the duplicate props already present in those models.
- Introduce the cup before extraction starts. Coffee pours into the cup through its open top.
- Coordinate visibility and camera framing so machinery can enter or leave off-camera without obvious popping.
- Keep realistic relative sizes as a starting point. The small bean must remain readable through camera framing and restrained artistic scaling.

## 5. Existing asset inventory

All five GLBs previously passed structural validation and Blender re-import. They are static source models, not completed animation rigs.

| Asset | Source GLB | Current size | Triangles | Readiness |
| --- | --- | ---: | ---: | --- |
| Packaging | `Assets/Models/CoffeePackaging/coffee-packaging.glb` | 0.52 MB | 19,060 | Needs a real opening mouth and closure controls |
| Bean | `Assets/Models/CoffeeBeans/coffee-bean.glb` | 3.35 MB | 20,224 | Good close-up source; too detailed to duplicate extensively unchanged |
| Cup and saucer | `Assets/Models/CoffeeCup/coffee-cup.glb` | 1.03 MB | 56,108 | Hollow cup exists; liquid and crema need fill animation |
| Grinder | `Assets/Models/CoffeeGrinder/coffee-grinder.glb` | 1.89 MB | 86,764 | Separate lid/beans/grounds exist; add working animation anchors |
| Espresso machine | `Assets/Models/EspressoMachine/espresso-machine.glb` | 1.32 MB | 26,936 | Named lever pivot exists; portafilter grouping needs refinement |

Current GLB payload is about **8.11 MB total**, before animation derivatives and any optimization. File size does not predict decoded texture/GPU memory usage; profile both.

Each folder also contains a `.blend` source, `preview.png`, model metadata and validation results. Existing render fixtures are excluded from GLB exports.

## 6. Asset preparation required before animation

### Packaging

- The current pouch body has a closed top cap. Moving the rolled closure alone will not create a believable opening.
- Remove or replace the cap in a derivative, add interior-facing geometry, and create an open mouth with usable thickness.
- Separate the closure halves/flaps and provide sensible pivot positions.
- Prefer closed/open morph targets for the pouch mouth, with separate transforms for the rolled closure. Verify exported morph targets in Three.js.
- Define `bagMouth` and `beanRelease` anchors. Make bean paths start inside the mouth after it has opened.
- Preserve the HTML color palette and avoid stretching the label when deforming the upper bag.

### Beans and grounds

- Derive a lightweight falling-bean mesh from the existing bean, initially around 500–1,500 triangles each.
- Use `InstancedMesh` for an initial 40–80 visible moving beans on desktop; reduce the count on constrained devices.
- Share geometry/materials and use a fixed seed for paths, scale variation and orientation.
- Use small instances or points for grounds and a simple growing mound inside the portafilter.
- Do not simulate live rigid-body physics: a scroll sequence must reverse and jump to arbitrary progress predictably.

### Grinder

- Animate or temporarily remove its lid so falling beans have a clear entry path.
- Hide the existing prefilled `Beans inside hopper` mesh at the beginning. Reveal staged fill geometry or instances as beans arrive.
- Separate initial static grounds from the animated dosing mound; avoid two visible doses.
- Add `hopperEntry`, `grinderOutlet`, and `filterDock` anchors.
- Reuse the modeled housing as an exterior. Internal burr machinery is not necessary for this story.
- Test the acrylic's glTF transmission material in the actual Three.js scene. Provide a cheaper lightly tinted transparent material if transmission is too costly or hides the beans.

### Portafilter handoff and espresso machine

- The grinder and machine currently contain different portafilter props. Create one shared animated assembly for the transfer and hide the corresponding static props.
- The machine's existing `Portafilter assembly` groups its neck and wooden grip, not a complete removable basket. Include an appropriate basket/rim and coffee grounds in the transferable derivative.
- Keep the fixed chrome brew group separate from the removable basket.
- Set explicit grip/basket pivots; preserve world transforms when reparenting.
- Add `machineFilterDock`, `espressoOutletLeft`, `espressoOutletRight`, and `cupDock` anchors.
- Test the existing `Lever pivot - animate local X` and limit its motion to avoid intersection with the group housing.
- The model has two outlets. Use two fine streams or a visually coherent merged stream aligned to their actual positions.

### Cup, coffee and pouring

- Start with the cup's static coffee and crema hidden.
- Create a controllable coffee surface whose height and radius follow the cup's interior profile. Simply moving the existing full-width disk downward would intersect the tapered walls.
- Construct the stream with a tube or narrow mesh and a coffee material. Control its length and visibility from story progress.
- Add restrained ripples and optional steam after filling. These are visual effects, not a fluid simulation.
- Use the saucer in the final composition. Check its width against the machine's small drip platform; for pouring, place the cup alone on the platform and bring the saucer in for the final reveal if needed.

### Export contract

- Keep original sources unchanged; write derivatives to `Assets/Models/AnimationReady/<asset>/`.
- Export only model objects, with textures embedded and stable named nodes/anchors.
- Use meters and glTF's Y-up convention. Convert Blender-space animation assumptions rather than applying a second axis correction to imported GLBs.
- Record each derivative's dimensions, forward direction, anchor names and available morph targets in an asset manifest.
- Re-run structural checks, re-import, and browser material inspection after any geometry/export change.

## 7. Animation and scene architecture

- Use one persistent Three.js renderer, one scene, and one perspective camera throughout the story.
- Use a long semantic story section with a sticky full-height stage. Begin with a total section height of approximately `600–750vh` (about 6–7.5 screens), then tune readability and pacing. Account for the sticky stage's own height when mapping the usable scroll distance.
- ScrollTrigger maps the story section to progress `p` in `[0, 1]`, with a short scrub smoothing interval.
- Keep one source of truth for story progress. Do not run independent scroll listeners for each model.
- Define camera position, look-at targets, model transforms, mouth opening, particle positions, grinder fill, lever angle, stream visibility and cup fill as functions of progress.
- Store scene ranges, camera keyframes and motion curves in a typed configuration file so visual tuning does not require rewriting scene logic.
- Use a single rendering loop. GSAP updates progress; Three.js evaluates the current scene state and renders it. Avoid two competing animation loops.
- Evaluate every effect at the current progress. Avoid incremental “add one more bean” mutations that break when scrolling backward or jumping ahead.
- Precompute seeded bean paths. Use local anchors converted to world coordinates for release and landing locations.
- Interpolate rotations with quaternions where appropriate. Keep movement smooth across scene boundaries and camera targets away from singular orientations.
- Idle float, steam and tiny liquid noise may use time, but must not advance the story or alter its final state. Stop them for reduced motion and hidden tabs.
- Do not enable public OrbitControls: the cinematic camera is scroll-controlled. A development-only camera inspector may be useful for tuning.
- Clean up renderer resources, listeners and ScrollTriggers during hot reload to avoid duplicate canvases and memory leaks.

## 8. Page structure and shopping destination

1. Minimal header: Mr. Bean brand, a Shop link, and an accessible “Skip story” link.
2. Story stage: 3D canvas, scene copy, subtle progress indication and initial scroll cue.
3. Final scene: exact headline and Shop Now CTA in HTML.
4. A local `#shop` collection section below the story, giving the CTA a real destination.
5. Simple footer.

Default Shop Now behavior: scroll to `#shop`, move keyboard focus to its heading when appropriate, and respect reduced motion. Opening `/#shop` directly must work without waiting for 3D assets.

Use the four coffees from the supplied HTML as provisional local catalog data: Ethiopia Yirgacheffe, Guatemala Antigua Velvet, Sumatra Mandheling Highlands, and Mr. Bean Signature Dawn Blend. Product titles, prices, weights and tasting notes must live in one data file, clearly treated as prototype content until confirmed.

Initial scope is the animated landing page and a small local collection destination. If Add to Bag controls are included later, they must actually update a browser-local cart and support remove/quantity changes. Do not add fake checkout, subscriptions, reviews, search, or account controls merely because they appeared in the reference HTML. A full commerce implementation is a separate phase.

## 9. Loading, responsiveness and accessibility

- Display branded HTML and a local packaging poster immediately. Show honest loading progress or an indeterminate indicator when byte totals are unavailable.
- Prioritize the packaging; load the remaining story assets next. If the visitor reaches a scene before its asset is ready, retain readable copy and its poster without blocking page scrolling.
- Provide retry/fallback behavior for a failed GLB. The headline and Shop Now button must remain usable.
- Use local studio lighting or a bundled, licensed environment map. Avoid remotely hosted environment presets.
- Reserve canvas dimensions to prevent layout shifts. Recalculate camera framing and scroll boundaries on viewport changes and after fonts load.
- Desktop: stage and text can share horizontal space. Mobile: place the object centrally, keep text in a dedicated safe region, shorten travel and use fewer beans.
- Test at 1440×900, 1920×1080, 768×1024, 390×844 and 360×800.
- Honor `prefers-reduced-motion` with static scene panels or a condensed static narrative. Disable long camera travel, particle falls, steam and smooth scrolling.
- Support keyboard navigation, visible focus, adequate contrast and readable text at 200% zoom. Avoid announcing every scroll update through a live region.
- Treat the decorative canvas as hidden from assistive technology; provide the full story and final CTA in the DOM.
- Provide static posters if WebGL is unavailable or its context is lost. Retain the same accessible shopping destination.

## 10. Performance targets

These are starting targets, not measured guarantees:

- Aim for 60 fps on the user's desktop and at least 30 fps on a constrained mobile-sized test profile.
- Cap pixel ratio initially at 1.5 on desktop and 1 on lower-quality settings; increase only after profiling.
- Render only the current and adjacent transition assets. Shared GPU assets can remain cached without keeping every model visible.
- Target fewer than roughly 250k visible triangles and 100 draw calls in typical scenes; profile transparent passes and shadows separately.
- Reuse bean instances. Merge suitable static submeshes by material only where doing so preserves required pivots and anchors.
- Use limited shadow-casting lights and inexpensive contact shadows. Keep bloom, depth of field and volumetric effects out of the first pass.
- Pause the animation loop when the document is hidden and, where practical, when the story is offscreen.
- Investigate texture downscaling, local KTX2/mesh decoders or further mesh reduction only if measurements justify them; ship decoder files locally if added.
- Check loading from a cold browser cache as well as repeated visits.

## 11. Proposed project layout

```text
cofeewebsite/
  plan.md
  Assets/                         # Existing references and editable 3D sources
    Models/
      AnimationReady/             # Future derivatives; preserve original models
      scripts/
  package.json
  package-lock.json
  index.html
  tsconfig.json
  vite.config.ts
  public/
    models/                       # Only runtime animation-ready GLBs
    images/                       # Posters and local product images
    fonts/                        # Font files and license notices
    environments/                 # Only if a local HDR environment is needed
  src/
    main.ts
    styles.css
    data/products.ts
    scene/createScene.ts
    scene/loadAssets.ts
    scene/assetManifest.ts
    scene/lighting.ts
    story/config.ts
    story/evaluateStory.ts
    story/scrollController.ts
    effects/beans.ts
    effects/grounds.ts
    effects/coffeePour.ts
    ui/loading.ts
    ui/accessibility.ts
    ui/shop.ts
  tests/
    story.test.ts
  dist/                           # Generated local static build
```

Copy only runtime derivatives into `public`; do not bundle `.blend` files, Python scripts, original photographs, or model validation reports into the served build.

## 12. Implementation order and completion gates

### Phase A — local foundation

- Create the Vite/TypeScript project without overwriting `Assets` or this plan.
- Add the small dependency set and lockfile; configure the server for `127.0.0.1`.
- Establish CSS tokens, local fonts, semantic page structure and a functional Shop Now anchor.
- Gate: the page and shop destination work locally without any 3D.

### Phase B — model preparation

- Prepare the opening pouch, lightweight bean, grinder anchors, shared portafilter and cup fill geometry.
- Verify each derivative before moving to the next asset.
- Gate: each asset loads in Three.js with correct scale, material, orientation and animation controls.

### Phase C — complete story blockout

- Create the single canvas, camera path and normalized progress controller.
- Block out all six scenes using the actual models before polishing individual effects.
- Gate: every required action can be reached, reversed and skipped without missing or duplicated objects.

### Phase D — motion and materials

- Refine opening, falling beans, hopper fill, grinding, portafilter transfer, lever action, pouring and cup fill.
- Add studio lighting, restrained shadows and coordinated DOM text transitions.
- Gate: the entire bean-to-cup story is visually understandable at normal scrolling speed.

### Phase E — responsive/fallback experience

- Tune desktop/mobile framing, loading states, reduced-motion behavior and WebGL failure behavior.
- Add the final product composition and local coffee collection.
- Gate: headline and shopping destination remain accessible in every mode.

### Phase F — verification and handoff

- Run TypeScript checks and a local production build.
- Test deterministic animation state at scene boundaries, reverse scrolling, direct progress jumps, and cup-fill limits.
- Inspect the running page in a browser at the listed viewport sizes and capture representative scenes.
- Gate: all acceptance criteria below pass, or any tool/hardware verification limit is explicitly documented.
- Document the exact local run commands and leave a working localhost preview when implementation is complete.

## 13. Verification checklist

- [ ] First view clearly features the branded packaging.
- [ ] Packaging genuinely opens; beans emerge through its mouth.
- [ ] Beans visibly enter the grinder with its lid out of the way.
- [ ] Grinder produces grounds into a portafilter.
- [ ] One filled portafilter transfers and locks into the espresso machine.
- [ ] Cup is positioned before extraction; lever and stream are coordinated.
- [ ] Coffee flows into the cup and rises without intersecting ceramic walls.
- [ ] Final headline is exactly “Your Favorite Brew, Made at Home.”
- [ ] Shop Now works using mouse, touch and keyboard.
- [ ] Reverse scrolling, fast scrolling, scrollbar jumps and reload at mid-story yield coherent states.
- [ ] Resizing/orientation changes do not duplicate ScrollTriggers or reset the story unexpectedly.
- [ ] Assets, fonts and libraries are served locally; no remote runtime requests are required.
- [ ] Missing assets, WebGL failure and reduced motion retain readable content and shopping access.
- [ ] No console errors, missing GLB resources, duplicate canvases or fake purchase confirmations.
- [ ] Frame-rate and memory measurements are recorded on the test machine.
- [ ] No website has been published or deployed.

## 14. Future local commands

These commands describe the intended workflow after implementation; the project scripts do not exist yet:

```powershell
npm.cmd install
npm.cmd run dev -- --host 127.0.0.1
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1
```

Use the URL printed by Vite, normally port 5173 for development and 4173 for preview. Use `npm.cmd ci` for a clean installation once the lockfile exists. Stop the foreground server with Ctrl+C. Do not open `index.html` directly through `file://`; model loading and module imports need the local HTTP server.

Bind to localhost by default. Testing on a physical phone over the LAN is optional and requires an explicit server-host/network configuration change; desktop mobile emulation is sufficient for the initial local-only deliverable.

## 15. Inputs and decisions still needed

No additional 3D reference images are required to begin implementation once authorized.

- User instruction to start coding was received; implementation is now present.
- Product prices, currency and real catalog details are unconfirmed. Use centralized prototype data rather than blocking the animation work.
- Supporting scene copy is provisional; preserve the final required headline exactly.
- Default CTA destination is the local `#shop` collection. Change it only if the user supplies another destination.
- Audio is off and omitted by default; no sound assets are needed.
- Obtain local font files/license notices, and optionally a licensed studio environment map. Procedural studio lighting is an acceptable default.
- Determine final animation camera coordinates after the derivative models are inspected in the browser; do not guess irreversible positioning now.

## 16. Technical references

Consulted during planning; recheck package compatibility when implementation begins:

- [Vite guide](https://vite.dev/guide/) — local server, TypeScript starter and static build workflow.
- [Three.js documentation](https://threejs.org/docs/) — rendering, GLTFLoader, instancing and material APIs.
- [GSAP ScrollTrigger documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) — scroll progress, scrub behavior and layout refresh.

These links are developer references only, not runtime dependencies.

## 17. Background story revision — October 15, 2026

The current visual direction supersedes the earlier split text/model layout: all six chapters now place centered copy in front of a large, centered 3D scene. A translucent burgundy layer dims the animation while preserving the #2D0000 page backdrop. The camera fits model bounds, targeting roughly three quarters of the viewport height for the opening packaging and widening smoothly for the bean-to-grinder handoff. Travelling beans follow the packaging scale.

The story has 1000vh of scroll distance on desktop and 900vh on mobile. One GSAP timeline with 1.25-second scrub interpolation drives both copy and models; Three.js renders continuously at the display's available refresh rate. There is no fixed frame-count animation or guaranteed device FPS. Hidden particles skip instance-buffer updates, reusable vectors reduce allocations, and diagnostics update once per second.

Build/type checking and all 11 existing story/asset tests pass. Browser visual and real-device performance review remain pending because the preview access restriction documented in README still applies.

## 18. Progressive close-up reveals — October 15, 2026

This replaces section 17's fit-to-screen framing. Models are deliberately oversized and cropped, with a scroll-driven camera revealing their details over time. The packaging begins at its upper seal and travels down to its base before returning to the opening. The camera follows the released beans to the hopper, descends to the grinder outlet and basket, rises to the espresso lever, then follows the spout to the coffee surface and cup body. The text remains centered above the dimmed scene.

`src/story/cameraStory.ts` defines continuous, reversible detail shots using live model anchors. Close-up frames show roughly 52–63% of each subject's height; portrait layouts also retain the crop instead of zooming out to fit. Handoffs have wider contextual shots. Scroll distance is now 1800vh desktop / 1600vh mobile, with the existing 1.25-second shared scrub timeline.

Build/type checking and all 15 tests pass. New tests check projected packaging cropping at desktop and mobile aspect ratios, top-to-bottom reveal, tight framing for the other main subjects, and continuity/reversibility of the camera path. These are mathematical checks; rendered visual review and device FPS verification remain pending under the existing browser access limitation.

## 19. Final product composition correction

The ending now pulls back from the pour to show the entire packaging and cup together. This supersedes the cropped final cup framing in section 18. The settled products' combined world bounds include the cup handle and saucer; a perspective fit accounts for object depth, camera tilt and viewport aspect ratio, leaving a margin around the pair. Earlier close-up reveals remain intact. Build and all 19 tests pass, including projected final bounds at four desktop/tablet/mobile aspect ratios. Browser visual verification remains pending.

## 20. White reference sequence — October 20, 2026

The four images in `sequence/` now guide the opening layout: white background, burgundy typography at left, package at right tipping toward the grinder. The package's original cream/burgundy materials remain intact. Later pouring/final scenes retain centered text and the complete final product pair.

The grinder is in place and its lid is clear before beans arrive. Travelling beans land inside the hopper; a lightweight 720-bean pile builds in layers without stretching the beans. Filling ends at progress .385, the camera holds on the hopper through .435, grinding starts at .455, and the filled portafilter transfers at .525. This separates filling, a full-pile pause, the downward camera move, and dosing.

The coffee stream uses a segmented deforming mesh, varying width and small lateral motion. Extraction begins/ends with drops and periodically breaks into drops during the main pour. Drops accelerate toward the coffee surface, which has edge-damped waves and expanding ripples. Effects turn off when seeking outside extraction; reduced motion still uses the static story.

Automated camera/state/liquid tests cover filling before grinding, the hopper camera hold, stream/drop transitions and shutoff, plus the previous model/finale contracts. Actual rendered visual review and real-device performance measurements remain pending under the documented browser preview restriction.
