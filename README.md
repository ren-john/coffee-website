# Mr. Bean — Your Favorite Brew, Made at Home.

A local Vite + TypeScript coffee storefront with a Three.js + GSAP landing story. The scroll story opens the packaging, follows beans into the grinder, transfers the filled portafilter into the espresso machine, pours into the cup, and ends with the headline and Shop Now button.

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
- A warm neutral `#F2F0EF` background with burgundy type. Packaging uses brown `#733E24`, deep burgundy `#300916` accents and cream lettering. The opening composition follows `sequence/`: copy on the left and the package pouring from the right.
- Oversized, cropped models revealed by a scrolling camera: packaging top to bottom, mouth to falling beans, hopper to grinder outlet, machine lever to spout, then the cup's rim and body. Detail shots intentionally do not fit the whole model, including on mobile. Beans inherit the pouch's scale during release.
- The final headline is the exception: the camera pulls back to fit the complete package and cup together, including the handle and saucer, with a margin. Framing uses their combined bounds and adjusts to the viewport aspect ratio.
- A longer scroll sequence (1800vh desktop / 1600vh mobile) and 1.25-second scroll interpolation keep the copy and animation synchronized between scroll events. Hidden particle buffers are not updated.
- All five custom 3D models, plus a shared portafilter for the handoff.
- Openable packaging with two mouth morph targets and a separate closure pivot.
- Instanced falling beans and a dense, growing hopper pile. The camera holds on the hopper through the last arrivals and a full-pile pause, then descends to the grounds outlet.
- Detailed coffee beans with a 6,066-triangle close-up mesh and full-resolution color, roughness and normal maps. The hopper uses a matching 566-triangle mesh sharing the same material. Editable source: `Assets/Models/AnimationReady/bean-quality.blend`; regenerate with `Assets/Models/scripts/prepare_quality_beans.py` in Blender.
- Beans use a matte roasted skin (roughness 0.77–0.98), low specular/environment reflection, and varied pile size/color with shadows. To regenerate their maps first, run `python Assets/Models/scripts/make_bean_textures.py --matte --output Assets/Models/AnimationReady/matte-bean-textures` (NumPy and Pillow required).
- Flexible espresso streams with intermittent individual drops, expanding impact ripples and a gently moving coffee surface that settles after extraction.
- Cream/burgundy styling and locally bundled Newsreader / Source Sans 3 fonts.
- Shopping tabs for Coffee, Equipment, Brew guide and Orders, accessible throughout the landing story.
- The supplied 2026 Mr. Bean seal appears in the header/footer, browser icon, shop pouch illustrations and 3D package. The original JPEG is preserved; CSS and model UVs frame its circular seal. The matte logo mesh conforms to the pouch and shares its opening morph.
- The website renders the seal with an unlit, untone-mapped material so the bright studio lighting does not turn its deep burgundy ink into bright red. The package itself retains its lit paper material.
- A separate storefront with seven products, searchable/filterable collections, price sorting, product detail pages, size/grind selectors, and related products. Its entry point does not load Three.js or the animated scene.
- A browser-local shopping bag shared between the landing page and storefront, with variant-specific quantities, removal, and size-dependent prices calculated in cents.
- Demo checkout with validated contact/delivery forms, delivery choices, order confirmation and the latest 30 demo orders saved locally. Contact/address fields are never stored or transmitted; no card information is requested.
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
| `shop.html`, `src/store.ts`, `src/store.css` | Store navigation, collection/detail pages, bag, checkout, orders and responsive layout |
| `src/data/catalog.ts` | Coffee/equipment catalog, descriptions, sample prices and search/filter logic |
| `src/data/cart.ts` | Shared bag validation, browser persistence, variant pricing and delivery totals |
| `src/ui/productViews.ts` | Shared product artwork, cards and option selectors |
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

Shopping tests also cover merging separate variants, currency rounding, invalid saved data, unavailable storage, quantity limits, persistence across page instances, delivery thresholds, equipment pricing, and combined catalog filters/sorting.

## Shopping flow

Open `http://127.0.0.1:5173/shop.html#/coffee` after starting the development server, or use the Coffee/Equipment tabs on the home page. Explore a product, select options, and use Add to bag or Buy now. The bag and checkout live at `#/cart` and `#/checkout`; `#/orders` shows previous demo confirmations. Collection search/filter selections are retained in the URL. Direct links and refreshes work through the hash routes.

All customer-facing prices use Philippine pesos (PHP / ₱), with a fixed demo conversion of ₱60 per US$1. This is not a live exchange rate. Equipment prices and specifications remain placeholders. Standard demo delivery is ₱357, free for merchandise totals of ₱3,000 or more; express is ₱777. Catalog calculations and saved order amounts retain their original base USD cents and pass through the shared PHP formatter, preserving existing bags and order history without relabeling dollar values as pesos. Taxes are not calculated. These are sample rules, not live carrier quotes.

This is a functional local shopping demonstration, not a live payment or fulfillment system. Real sales require a backend, payment integration, server-side pricing/inventory validation, tax/delivery rules and order handling. Browser storage contains only bag variants and demo order summaries; clearing browser data removes them. If storage is unavailable, the current page remains usable in memory, but persistence across reloads or the two page entry points is unavailable.

## Verification limitation

Type checking, automated tests and the production build have been run. Browser automation rejected access to the localhost preview, so visual scene framing, responsive appearance, keyboard interactions and real FPS/memory measurements still require a browser review. This is not a claim of completed visual QA.

To review manually, use the six scene buttons at the bottom of the stage, scroll forward and backward, resize the window, and try the shopping bag. Suggested widths: 1440, 768, 390 and 360 pixels. Enable reduced motion in the operating system to check the static version. The scene container exposes `data-fps`, `data-triangles` and `data-draw-calls` for local development inspection.

The prototype product values came from the supplied storefront concept and remain editable; they are not connected to live inventory.
