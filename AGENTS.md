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
| `PROJECTMANAGMENT` | GCP SA JSON — optional GHA deploy via `cloudbuild.yaml` |
| `FIREBASEMANNYDOORS` | `firebase login:ci` token **or** service-account JSON for `property-managment-a5ed3` Functions |
| `GCP_PROJECT_ID` | Optional GCP project override |

## PRs

Base branch: **`main`**
