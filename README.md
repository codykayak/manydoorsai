# ManyDoors AI

Standalone property-management platform for [manydoorsai.com](https://www.manydoorsai.com).

Extracted from the Macro REI monorepo (`codykayak/realestate` → `src/property-management`).

## Develop

```bash
npm ci
npm run dev
```

Open http://localhost:5173/

## Build

```bash
npm run build
```

## Deploy

### Cloud Run (`manydoorsai`)

Use a **Cloud Build trigger** named `manydoorsai` on this repo (`main` branch), pointing at **`/cloudbuild.yaml`**.

1. GCP Console → **Cloud Build** → **Triggers** → create or edit `manydoorsai`
2. Source: GitHub `codykayak/manydoorsai`, branch `main`
3. Configuration: **Cloud Build configuration file** → `cloudbuild.yaml`
4. Service account with **Cloud Build Editor**, **Storage Admin**, **Cloud Run Admin**

The build tags `gcr.io/$PROJECT_ID/manydoorsai` and deploys Cloud Run service **`manydoorsai`** in `us-west1`.

Map custom domain **manydoorsai.com** in Cloud Run → **manydoorsai** → Manage custom domains.

GitHub Actions **`Deploy to Cloud Run`** runs the same `cloudbuild.yaml` when secret **`PROJECTMANAGMENT`** is set (same SA permissions as above). Disable this workflow if you only use the GCP trigger.

Smoke test after deploy:

```bash
./scripts/verify-live-deploy.sh
```

**Pitch video missing on manydoorsai.com?** Production is almost certainly a **stale Cloud Run revision** (old JS still references a broken PNG). Code on `main` is correct. Redeploy:

```bash
# From your laptop (gcloud auth login first)
./scripts/deploy-cloud-run.sh
```

Or GCP Console → **Cloud Build** → trigger **`manydoorsai`** → **Run** on branch `main`. Then confirm Cloud Run → **manydoorsai** → latest revision has **100% traffic**.

**Builds succeed but the live site never changes?** Traffic is pinned to an old revision, so new revisions deploy with **0% traffic**. `cloudbuild.yaml` now runs `update-traffic --to-latest` after every deploy, but to recover an already-stuck service immediately:

```bash
gcloud run services update-traffic manydoorsai --region us-west1 --to-latest
```

Verify the live nginx `index.html` is fresh (the `last-modified` header should be recent):

```bash
curl -sI https://www.manydoorsai.com/ | grep -i last-modified
```

### Firebase Functions (site chat)

Uses project **`property-managment-a5ed3`** and GitHub secret **`FIREBASEMANNYDOORS`**:

- **Recommended:** `firebase login:ci` token (paste the full token — not JSON)
- **Legacy:** service-account JSON key

Set `GEMINI_API_KEY` in Firebase **after** the first Functions deploy (console may say “build backend first” until `pmGatewayChat` exists):

```bash
firebase functions:secrets:set GEMINI_API_KEY --project property-managment-a5ed3
firebase deploy --only functions --project property-managment-a5ed3
```

All site contact email routes to **`info@manydoorsai.com`**. For the contact widget via EmailJS, set template “To” to `{{to_email}}` and add `VITE_EMAILJS_*` to Cloud Build / Docker build args.

The SPA calls `pmGatewayChat` on `property-managment-a5ed3` via `VITE_PM_CHAT_URL` in `cloudbuild.yaml` / `Dockerfile`.

## Environment

See `.env.example`. Production builds bake defaults via `cloudbuild.yaml` / `Dockerfile`.

| Variable | Purpose |
|----------|---------|
| `VITE_PM_BASE_PATH` | `/` (default) |
| `VITE_PM_SITE_URL` | `https://www.manydoorsai.com` |
| `VITE_PM_SUPPORT_EMAIL` | `info@manydoorsai.com` |
| `VITE_PM_CHAT_URL` | `pmGatewayChat` on `property-managment-a5ed3` |
| `VITE_EMAILJS_*` | Optional contact form (template To: `{{to_email}}`) |
| `VITE_PM_FIREBASE_*` | PM Firestore client (defaults in `firebasePublic.js`) |

## Setup checklist (complete)

- [x] Cloud Run `manydoorsai` + custom domain
- [x] Firebase Functions `pmGatewayChat` + `GEMINI_API_KEY`
- [x] Firestore rules on database `property-managment`
- [x] `robots.txt` + `sitemap.xml`
- [x] macrorei.com `/property-management` → manydoorsai.com (301)
- [ ] EmailJS keys on Cloud Build trigger (optional — mailto fallback works)
