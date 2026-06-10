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
| `PROJECTMANAGMENT` | GCP SA JSON with **Cloud Build Editor**, **Storage Admin**, **Cloud Run Admin** |
| `FIREBASEMANNYDOORS` | `firebase login:ci` token **or** service-account JSON for `property-managment-a5ed3` |
| `GCP_PROJECT_ID` | Optional GCP project override |

## Deploy paths (pick one)

1. **GCP Cloud Build trigger `manydoorsai`** on `main` → Cloud Run (recommended for manydoorsai.com)
2. **GitHub Actions `Deploy to Cloud Run`** — needs `PROJECTMANAGMENT` or a SA with GCR + Run permissions (Firebase SA alone is not enough)
3. **GitHub Actions `Deploy Firebase Hosting`** — uses `FIREBASEMANNYDOORS`; map **manydoorsai.com** in Firebase Console → Hosting → Custom domains if Cloud Run is stale

If pitch video shows a broken image, production is stale. Run `./scripts/verify-live-deploy.sh`.

## PRs

Base branch: **`main`**
