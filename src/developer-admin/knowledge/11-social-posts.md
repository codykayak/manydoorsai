# Daily social posts factory

Automated FB / Instagram / X content pipeline for ManyDoors AI marketing.

## What it does

Every day at **7:00 AM Pacific**, Cloud Function `pmSocialPostScheduler`:

1. Picks a topic tied to manydoorsai.com (maintenance, leasing, communications, etc.)
2. Searches the web for a recent industry article (Gemini + Google Search)
3. Writes platform-specific captions (Facebook, Instagram, X)
4. Generates branded images via **NanoBanana** (Gemini image model)
5. Stores the bundle in Firestore + Firebase Storage
6. Sends you an **SMS** when posts are ready for review

Review and approve in **Developer Admin → Social posts** (`/developer-admin?tab=social`).

## Firebase Functions

| Function | Purpose |
|----------|---------|
| `pmSocialPostScheduler` | Daily cron (7 AM PT) |
| `pmSocialPosts` | Admin HTTP API (list, generate, approve, edit) |

## Required Firebase secrets

Set in Firebase Console → Functions → Secrets (project `property-managment-a5ed3`):

| Secret | Purpose |
|--------|---------|
| `GEMINI_API_KEY` | Text + image generation (already used by site chat) |
| `SOCIAL_ADMIN_API_KEY` | Password for the admin panel API (pick a long random string) |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_FROM_NUMBER` | Twilio SMS sender (E.164, e.g. `+15551234567`) |
| `SOCIAL_NOTIFY_PHONE` | Your phone for daily alerts (default `+15413212630`) |

### Set secrets via CLI

```bash
firebase functions:secrets:set SOCIAL_ADMIN_API_KEY --project property-managment-a5ed3
firebase functions:secrets:set TWILIO_ACCOUNT_SID --project property-managment-a5ed3
firebase functions:secrets:set TWILIO_AUTH_TOKEN --project property-managment-a5ed3
firebase functions:secrets:set TWILIO_FROM_NUMBER --project property-managment-a5ed3
firebase functions:secrets:set SOCIAL_NOTIFY_PHONE --project property-managment-a5ed3
```

Redeploy functions after adding secrets:

```bash
firebase deploy --only functions --project property-managment-a5ed3
```

## Admin panel setup

1. Go to **Developer Admin → Social posts**
2. Enter your `SOCIAL_ADMIN_API_KEY` (saved in browser session only)
3. Confirm your SMS phone number
4. Click **Generate today** to test, or wait for the 7 AM scheduler

## Firestore

- Collection: `socialPosts/{YYYY-MM-DD}` — daily post bundles
- Document: `socialConfig/settings` — notify phone, schedule preferences

Client access is denied in `firestore.rules`; all reads/writes go through the Admin SDK in Cloud Functions.

## Storage

Images: `social-posts/{date}/{facebook|instagram|x}.png` in bucket `property-managment-a5ed3.firebasestorage.app`.

## Environment (frontend)

`VITE_PM_SOCIAL_API_URL` — defaults to `pmSocialPosts` on `property-managment-a5ed3`.

## Workflow

1. **7 AM PT** — scheduler runs, SMS hits your phone with a link to `?tab=social`
2. Open admin panel — stats bar shows today's status
3. Preview images + captions per platform (FB 16:9, IG 4:5, X 16:9)
4. **Copy caption** or **Copy all** → paste into FB/IG/X
5. **Download image** if needed for native upload
6. **Approve** → **Mark as posted** when live

### Admin API actions

| Action | Purpose |
|--------|---------|
| `generate` | Create today's bundle (`force: true` to overwrite) |
| `approve` / `reject` / `markPosted` | Workflow status |
| `update` | Edit captions (merges safely — won't wipe images) |
| `resendNotify` | Resend SMS for a post |
| `testSms` | Send test text to verify Twilio |

Phase 2 (not built yet): direct Meta Graph API auto-posting.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| No SMS | Check Twilio secrets; verify `TWILIO_FROM_NUMBER` is SMS-capable |
| 401 in admin | Wrong `SOCIAL_ADMIN_API_KEY` |
| No images | Confirm `GEMINI_API_KEY` has image model access; check function logs |
| Duplicate day | Scheduler skips if today's post exists; use **Generate today** with force via API `{ action: "generate", force: true }` |
