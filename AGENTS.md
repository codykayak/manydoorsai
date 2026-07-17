# Cloud Agent — manydoorsai repo

## Git push

Use secret **`junerealestate`** (classic PAT, `repo` scope) for `codykayak/manydoorsai`.

```bash
./scripts/setup-git-auth.sh   # if present
git push -u origin main
```

## GitHub Actions secrets (repo Settings → Secrets)

| Secret | Purpose |
|--------|---------|
| `PROJECTMANAGMENT` | GCP SA JSON — Cloud Run deploy via `cloudbuild.yaml` (Cloud Build + Storage + Run permissions) |
| `FIREBASEMANNYDOORS` | `firebase login:ci` token **or** service-account JSON for `property-managment-a5ed3` Functions only |
| `GCP_PROJECT_ID` | Optional GCP project override |

### Firebase Functions secrets (`property-managment-a5ed3`)

Set in Firebase Console or `firebase functions:secrets:set`:

| Secret | Purpose |
|--------|---------|
| `GEMINI_API_KEY` | Site chat + daily social post generation |
| `SOCIAL_ADMIN_API_KEY` | Developer Admin → Social posts API auth |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER` | Daily SMS when posts are ready |
| `SOCIAL_NOTIFY_PHONE` | Phone for daily alerts (default `+15413212630`) |

## Deploy

Production is **Cloud Run only** (`manydoorsai` service, `us-west1`). Site is not hosted on Firebase Hosting.

1. **GCP Cloud Build trigger `manydoorsai`** on `main` → `cloudbuild.yaml` (recommended)
2. **GitHub Actions `Deploy to Cloud Run`** — needs `PROJECTMANAGMENT`

If pitch video shows a broken image, production is stale. Run `./scripts/verify-live-deploy.sh`.

**Custom domain vs run.app:** After deploy, confirm `https://www.manydoorsai.com/` shows a recent `last-modified` header and the CSS bundle includes the `html,body,#root` reset. The service URL `https://manydoorsai-886711655757.us-west1.run.app/` may update before the custom domain if traffic/domain mapping is stuck — run `gcloud run services update-traffic manydoorsai --region us-west1 --to-latest` in the deploy project.

## PRs

Base branch: **`main`**

**Agent workflow (default):** After code changes are pushed, **merge the PR into `main` immediately** (do not leave draft PRs open). Merging triggers **Deploy to Cloud Run** and **Deploy Firebase Hosting** on push to `main`. Then:

1. Watch the deploy workflow: `gh run list --workflow=deploy-cloud-run.yml --limit 1` and `gh run watch <id>`
2. Run `./scripts/verify-live-deploy.sh` against `https://www.manydoorsai.com`
3. If verify fails but `manydoorsai-886711655757.us-west1.run.app` is fresh, report a custom-domain / traffic-routing issue (not a code issue)

Use `gh pr merge <number> --squash --delete-branch` when the PR is ready.

## Cursor Cloud specific instructions

Node 20+ (repo pins Node 20 via `Dockerfile`/`functions`; Node 22 works). Package manager is **npm** (`package-lock.json`). The update script runs `npm ci` in both the root and `functions/`.

**Frontend SPA (the product):** the only service you normally need for dev/testing.
- Run: `npm run dev` (Vite, http://localhost:5173/). Lint: `npm run lint`. Build: `npm run build`. Preview: `npm run preview` (4173).
- The demo operations app (`/dashboard`, `/maintenance`, `/residents`, `/leasing`, `/communications`, `/knowledge`, `/settings`, `/owner`) runs **fully standalone with browser-local demo data** — no backend, Firebase, or API keys required. AI features like Maintenance Triage are client-side heuristics (`src/lib/`), so they work offline.
- `npm run build` (not `dev`) fails unless the two `public/*.mp4` pitch videos exist (enforced by `scripts/check-site-assets.mjs`); both are committed.

**Known non-blocking:** `npm run lint` currently reports pre-existing errors in committed code (e.g. `react-hooks/set-state-in-effect`, unused vars). These are not from environment setup — do not "fix" them as part of setup.

**Firebase Functions (`functions/`, optional):** only power the site AI chat + social-post admin. Not needed to run/test the SPA (it targets the deployed function URLs by default). Running them locally (`npm run serve` → `firebase emulators:start`) requires the Firebase CLI plus `GEMINI_API_KEY`/`SOCIAL_ADMIN_API_KEY`/Twilio secrets — leave off unless specifically working on chat/social backend.

**AiBhive/communal-library** is static content for a separate external product — not runnable here.
