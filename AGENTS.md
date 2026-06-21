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

## PRs

Base branch: **`main`**
