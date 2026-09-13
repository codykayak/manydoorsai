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
| `GCP_PROJECT_ID` | Optional override — **project id only** (e.g. `property-managment-a5ed3`). Never paste `gcloud --substitutions` text here. If unset, deploy uses the `PROJECTMANAGEMENT` service account’s project. |

### Firebase Functions secrets (`property-managment-a5ed3`)

Set in Firebase Console or `firebase functions:secrets:set`:

| Secret | Purpose |
|--------|---------|
| `XAI_API_KEY` | Site chat (Grok / xAI) — primary; also mints Grok Voice Agent ephemeral tokens |
| `GEMINI_API_KEY` | Site chat fallback + daily social post generation |
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

**User standing instruction:** When they say **push**, **commit**, or **push and commit**, treat that as authorization to **ship to `main` immediately** — no confirmation prompts, no leaving PRs open.

**Publish path:** Commit in worktree `C:\Users\AiBhive\aibhiverepo\manydoorsai-worktree` only. Push to **`codykayak/manydoorsai` on GitHub** — never the parent AiBhive repo. Stage **only necessary files** for the task (no `node_modules`, binaries, or unrelated monorepo paths). GitHub Actions deploys from `main`; agents do not upload full repos to Google Cloud. `git push manydoorsai <branch>:main` (fast-forward). Use `gh pr merge` only if a PR already exists; otherwise push straight to `main`.

**Agent workflow (default):** After code changes are pushed, **merge the PR into `main` immediately** (do not leave draft PRs open). Merging triggers **Deploy to Cloud Run** and **Deploy Firebase Hosting** on push to `main`. Then:

1. Watch the deploy workflow: `gh run list --workflow=deploy-cloud-run.yml --limit 1` and `gh run watch <id>`
2. Run `./scripts/verify-live-deploy.sh` against `https://www.manydoorsai.com`
3. If verify fails but `manydoorsai-886711655757.us-west1.run.app` is fresh, report a custom-domain / traffic-routing issue (not a code issue)

Use `gh pr merge <number> --squash --delete-branch` when the PR is ready.
