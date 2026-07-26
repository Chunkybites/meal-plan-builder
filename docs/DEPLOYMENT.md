# DEPLOYMENT — local → GitHub → beta → production

_Written so the owner can follow it unaided. Provider: **Vercel** (static Vite build; free Hobby tier covers 10–100 beta users comfortably). No backend or database exists or is required for the beta._

## Architecture

```
LOCAL (npm run dev, http://localhost:5173)
   │  git push
   ▼
GITHUB (private repo, main branch)
   │  automatic build on push
   ▼
VERCEL — beta/production (static SPA + CDN)
   ├─ Feedback + error reports → Formspree endpoint (VITE_FEEDBACK_ENDPOINT)
   ├─ Analytics → Vercel Web Analytics (privacy-friendly, no cookies)
   └─ Runtime API: Open Food Facts (branded search only; fails quietly)
```

Environments: **local dev** = `npm run dev` (no gate, authoring tool on) · **beta** = Vercel production deployment of `main` with `VITE_BETA_CODE` set (gate on, authoring off) · **preview** = Vercel automatically builds every non-main branch/PR into a unique preview URL — use branches for risky changes. A separate "production" (public) environment is simply this same project later with `VITE_BETA_CODE` removed and the `noindex` meta dropped from `index.html`.

## One-time setup — minimal "friends & family" mode (current default)

No accounts beyond GitHub + Vercel. Feedback arrives as **normal emails**: the in-app
Send Feedback button opens the tester's email app pre-filled with their report plus
the page, version and browser.

1. **GitHub**: create a **private** repository (e.g. `meal-plan-builder`). Locally the repo is already initialised and committed; connect and push:
   ```bash
   git remote add origin https://github.com/<you>/meal-plan-builder.git
   git push -u origin main
   ```
2. **Vercel**: sign up with your GitHub account at vercel.com → **Add New → Project** → import the repo. Framework preset: **Vite** (auto-detected). Build command `npm run build`, output directory `dist` (defaults are correct).
3. **One environment variable** (Vercel → Project → Settings → Environment Variables → Production + Preview):
   | Name | Value | Purpose |
   |---|---|---|
   | `VITE_FEEDBACK_EMAIL` | your email address | Send Feedback opens a pre-filled email to you |
   Optional extras: `VITE_BETA_CODE` (adds the access-code screen — probably unnecessary for a few friends; the URL is unlisted and `noindex`ed). Note: `VITE_*` values are compiled into the public bundle — never put real secrets in them.
4. **Deploy**: Vercel builds automatically after import → share `https://<project>.vercel.app` with your friends.
5. Optional: enable **Web Analytics** (Vercel → Analytics tab, cookieless) and/or a custom domain (Settings → Domains).

### Upgrading later to structured feedback (when you outgrow email)

Create a free form at formspree.io and set `VITE_FEEDBACK_ENDPOINT` to its URL → feedback
submits in-app instead of via email, and throttled automatic **crash reports** switch on
(they need the endpoint; the email mode carries user feedback only). Nothing else changes.

## Deploying an update

```bash
npm run typecheck && npm run test && npm run validate-recipes && npm run validate-food
npm version patch        # bumps 0.1.x → footer version updates automatically
git add -A && git commit -m "…"
git push
```
Vercel builds and publishes automatically (~1 minute). The new version number appears in the footer — tell testers to hard-refresh.

## Rollback

Vercel → Project → **Deployments** → pick the last good deployment → **⋯ → Promote to Production**. Instant, no rebuild.

## Logs, errors, monitoring

- **Build failures**: Vercel → Deployments → click the failed build → logs.
- **Runtime crashes**: arrive in Formspree as `type: "auto-error"` submissions (throttled to 5/session, deduplicated, no personal data). Formspree emails you each submission by default.
- **Usage**: Vercel Analytics tab (visitors, pages, devices, countries).
- **Upgrade path** when the beta grows: add Sentry (`npm i @sentry/react`, init in `main.tsx` behind a `VITE_SENTRY_DSN` env var) and replace `src/utils/errorReporting.ts`. Not needed for ≤100 testers.

## Giving testers access

Send them: the URL + the beta code + a short note ("educational planning tool, in beta, feedback via the button"). Rotate the code by changing `VITE_BETA_CODE` and redeploying (testers re-enter once; their plans/data are untouched). The gate is a courtesy barrier, not security — the app stores everything locally in the tester's browser and holds no server data, so the risk profile of a leaked URL is low.

## Version discipline

`npm version patch` per deployed fix-batch; `npm version minor` when a feature ships (0.2.0). The footer and feedback payloads carry the version automatically, so "bug in v0.1.3" is traceable to a commit (`git log v0.1.3`).

## What is deliberately NOT here

No database, no user accounts, no server, no CI pipeline beyond Vercel's build, no Kubernetes. The app is a static bundle; keep it that way until real requirements (accounts, cross-device sync, live FDC proxy) force a server — the seams for those already exist (`/api/fdc`, `data/recipes/index.ts`).
