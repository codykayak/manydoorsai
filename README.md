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

### Cloud Run (`manydoors-pm`)

GitHub Actions on push to `main` when secret **`PROJECTMANAGMENT`** is set (same GCP SA as macrorei.com).

Map custom domain **manydoorsai.com** in Cloud Run → manydoors-pm → Manage custom domains.

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
