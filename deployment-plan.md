**Deployment plan — 26 October 2026**

Recommendation: deploy the current storefront on Vercel. It is a static Vite + TypeScript application, so it does not need a running application server or database. Railway is a viable alternative, especially if a future backend will live there. This plan covers publishing the existing demo; enabling real sales is a separate phase.

**Project findings**

- `npm run build` runs TypeScript checking and Vite, producing `dist/index.html` and `dist/shop.html`.
- The shop uses hash routes such as `/shop.html#/coffee` and `/shop.html#/checkout`. Preserve both HTML entry points; a blanket rewrite to the landing page is unnecessary.
- Models load from root-relative `/models/` URLs. Deploy at the domain root.
- No application environment variables, database, API, or payment service are required today. Bags and demo order summaries use browser storage and do not synchronize across devices or domains.
- The production build passed on Node 24.13.0 during this review. Output: 35 files, approximately 17.04 MiB uncompressed. The scene chunk is approximately 633 kB minified / 161 kB gzip; Vite reported its chunk-size warning. Total output size is not the amount downloaded on every visit.
- A fresh dependency install, automated tests, and browser QA were not run during this planning review. Include these in release validation.

| Decision | Vercel | Railway |
| --- | --- | --- |
| Fit for this project | Recommended static frontend host | Suitable static hosting, with room for related backend services |
| Build | Vite preset, `npm run build`, output `dist` | Railpack detects Vite and builds `dist` |
| Serving | Managed static delivery | Railpack-managed Caddy server |
| Runtime code changes | None expected | None expected with automatic static detection |
| Budget consideration | Hobby is limited to personal, non-commercial use; budget for a paid plan for a business site | Free tier has $1 monthly credit; Hobby is $5/month including $5 usage, with additional usage billed |

Platform references: [Vercel Vite support](https://vercel.com/docs/frameworks/frontend/vite), [Vercel Hobby restrictions](https://vercel.com/docs/plans/hobby), [Railpack static serving](https://railpack.com/languages/node/), and [Railway pricing](https://docs.railway.com/pricing/plans). Check pricing again when selecting the account plan.

**1. Prepare a reproducible release**

1. Review the current `version2` branch and select the intended release changes. Several runtime files are currently untracked, including `vite.config.ts`, `shop.html`, `src/store.ts`, the new commerce modules, `public/models/bean-pile.glb`, and the logo. Commit every required source and runtime asset before deploying from Git. Do not assume the remote repository matches this working folder.
2. Add `"engines": { "node": "24.x" }` to `package.json` and keep the lockfile consistent. Node 24 matches the tested environment and is [supported for Vercel builds](https://vercel.com/changelog/node-js-24-lts-is-now-generally-available-for-builds-and-functions).
3. Validate a clean checkout using `npm ci`, `npm run test`, and `npm run build`. On Windows, use `npm.cmd` if PowerShell blocks the npm script shim. The build already includes type checking.
4. Confirm `dist` contains both HTML pages plus models, images, fonts, CSS, and JavaScript. Publish only this output. Blender sources and reference material under `Assets/` are not needed at runtime; retain those source files in the project.
5. Choose the production branch deliberately. Keep the initial deployment on a provider URL until acceptance checks pass.

**2. Vercel deployment path — recommended**

Import the Git repository into a Vercel project. Use these settings:

| Setting | Value |
| --- | --- |
| Root directory | Repository root |
| Framework preset | Vite |
| Node.js | 24.x |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Application environment variables | None |

Deploy and verify `/` and `/shop.html#/coffee` first. Keep existing `.html` links; avoid introducing clean-URL redirects or SPA rewrites during the initial release. A `vercel.json` file is optional for these basic settings. Connect the custom domain only after preview validation. See [Vercel build configuration](https://vercel.com/docs/builds/configure-a-build).

**3. Railway deployment path — alternative**

Create a service from the GitHub repository using Railpack and the repository root. Set the build command to `npm run build`. Use these service variables to make detection explicit:

```text
RAILPACK_NODE_VERSION=24
RAILPACK_NODE_NPM_INSTALL=npm ci
RAILPACK_SPA_OUTPUT_DIR=dist
```

Leave the custom start command unset so Railpack can serve the Vite output with Caddy. Do not use the existing `dev` or `preview` scripts as production servers; both bind to loopback. Verify build logs show static serving and both HTML files are reachable. Generate a public domain, then set a health check against `/shop.html`.

If automatic serving needs customization, use a custom Caddyfile or a Node-build/Caddy-runtime Dockerfile. Serve `dist` on Railway's injected port with external interface binding, preserve real files, and return 404 for unknown files. No database or persistent volume is needed. See [Railpack configuration](https://railpack.com/languages/node/) and [Railway static hosting](https://docs.railway.com/guides/static-hosting).

**4. Acceptance checks before attaching the production domain**

- Open and refresh `/`, `/shop.html#/coffee`, a product, the cart, checkout, and orders. Navigate between home and shop and verify the bag persists on the same origin.
- Confirm every GLB, image, font, and script loads successfully. Missing model URLs must not silently return the home page as a successful HTML response.
- Exercise the six animation chapters, forward/backward scrolling, reduced motion, and the 3D failure/retry fallback.
- Check desktop and mobile widths, keyboard navigation, and a slower mobile connection. Measure loading and animation smoothness before deciding whether to compress textures/models further.
- Complete a demo checkout and verify its demo status is clear. Confirm no real payment or order fulfillment is implied.
- Inspect cache headers: hashed build assets can use long immutable caching; HTML and unversioned `/models/` and `/images/` need revalidation or short caching until their URLs are versioned.
- Add the chosen custom domain, apply the provider's DNS records, verify HTTPS, and choose one canonical hostname. Browser-local carts on the preview origin will not transfer to the custom domain.

**5. Release and operation**

Run tests and a clean build in CI before production releases. Use preview deployments for review, then release the tested commit. Record the commit SHA and deployment URL. Monitor failed asset requests, homepage/shop availability, bandwidth, and hosting spend.

If a release breaks the site, restore the last working deployment where available, or redeploy its recorded commit. Recheck the home page, shop, and models after rollback; unversioned asset caching can otherwise leave mixed versions visible.

**6. Future real-store phase**

Before accepting actual purchases, add server-side pricing and inventory validation, durable orders, a payment provider with verified webhooks, fulfillment handling, and real delivery/tax rules. Railway could host that API and database while the frontend remains on Vercel, or both could run on Railway. Keep credentials on the server; frontend build variables are public. Select this architecture when the commerce requirements are defined.

The immediate next implementation step is preparing the release commit and Node version pin, then deploying a preview on the selected host. Hosting configuration and publishing remain future actions under this plan.
