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

### Firebase Hosting (works today on every `main` push)

GitHub Actions workflow **`Deploy Firebase Hosting`** builds `dist/` and runs `firebase deploy --only hosting` using secret **`FIREBASEMANNYDOORS`**.

- **Preview URL:** https://property-managment-a5ed3.web.app (always has the latest `main` build)
- **Custom domain:** Firebase Console → **Hosting** → **Add custom domain** → `manydoorsai.com` and `www.manydoorsai.com`
- If the apex domain still shows an old build (broken pitch image), it is still mapped to **stale Cloud Run** — finish Firebase custom-domain setup and remove the Cloud Run domain mapping for the same hostnames.

Smoke test:

```bash
./scripts/verify-live-deploy.sh
./scripts/verify-live-deploy.sh https://property-managment-a5ed3.web.app
```

### Cloud Run (`manydoorsai`) — optional

Use a **Cloud Build trigger** named `manydoorsai` on this repo (`main` branch), pointing at **`/cloudbuild.yaml`**.

1. GCP Console → **Cloud Build** → **Triggers** → create or edit `manydoorsai`
2. Source: GitHub `codykayak/manydoorsai`, branch `main`
3. Configuration: **Cloud Build configuration file** → `cloudbuild.yaml`
4. Service account with **Cloud Build Editor**, **Storage Admin**, **Cloud Run Admin**

Or set GitHub secret **`PROJECTMANAGMENT`** to a deploy service-account JSON (the Firebase admin SA alone cannot push images or submit Cloud Build).

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
