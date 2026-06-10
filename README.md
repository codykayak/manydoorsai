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

### Cloud Run (`manydoorsai`) — recommended

Use a **Cloud Build trigger** named `manydoorsai` on this repo (`main` branch), pointing at **`/cloudbuild.yaml`**.

1. GCP Console → **Cloud Build** → **Triggers** → create or edit `manydoorsai`
2. Source: GitHub `codykayak/manydoorsai`, branch `main`
3. Configuration: **Cloud Build configuration file** → `cloudbuild.yaml`
4. Service account: same one used for Macro REI Cloud Run (needs Cloud Build + Cloud Run + Storage permissions)

The build tags `gcr.io/$PROJECT_ID/manydoorsai` and deploys Cloud Run service **`manydoorsai`** in `us-west1`.

Map custom domain **manydoorsai.com** in Cloud Run → **manydoorsai** → Manage custom domains.

### GitHub Actions (optional fallback)

`.github/workflows/deploy-cloud-run.yml` runs the same `cloudbuild.yaml` when secret **`PROJECTMANAGMENT`** is set. Disable this workflow if you only use the GCP trigger (avoids double deploys).

### Firebase Functions (site chat)

Uses project **`property-managment-a5ed3`** and secret **`forfucksake`** in GitHub Actions.

Set `GEMINI_API_KEY` on Firebase:

```bash
firebase functions:secrets:set GEMINI_API_KEY --project property-managment-a5ed3
```

Until Functions deploy on the PM project, the SPA uses the Macro REI chat endpoint via `VITE_PM_CHAT_URL` in the Dockerfile.

## Environment

| Variable | Purpose |
|----------|---------|
| `VITE_PM_BASE_PATH` | `/` (default) |
| `VITE_PM_SITE_URL` | `https://www.manydoorsai.com` |
| `VITE_PM_CHAT_URL` | Gemini chat endpoint |
| `VITE_EMAILJS_*` | Contact form email |
| `VITE_PM_FIREBASE_*` | PM Firestore (when wired) |
