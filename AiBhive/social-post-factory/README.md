# Social Post Factory

Automated daily social media pipeline for **Facebook**, **Instagram**, and **X**.

- Picks a topic from `config/topics.json`
- Researches industry news (Gemini + Google Search)
- Writes platform-specific captions
- Generates branded images (Gemini / NanoBanana)
- Optional daily SMS via Twilio
- Admin UI to review, edit, copy, and approve

Originally built for [ManyDoors AI](https://github.com/codykayak/manydoorsai); extracted as a standalone module for **AiBhive**.

## Folder layout

```
social-post-factory/
  functions/
    config/        brand.json, topics.json, knowledge.txt
    lib/           generator, handler, store, notify
  admin/           Standalone React admin panel (Vite)
  firebase.json
  firestore.rules
```

## Quick start

### 1. Customize config

Edit before first run (`functions/config/`):

- `functions/config/brand.json` — name, site URL, admin URL, voice, image style
- `functions/config/topics.json` — rotating post topics + site links
- `functions/config/knowledge.txt` — product/brand context for captions

### 2. Firebase secrets

```bash
cd social-post-factory/functions
npm ci
firebase functions:secrets:set GEMINI_API_KEY
firebase functions:secrets:set SOCIAL_ADMIN_API_KEY
firebase functions:secrets:set TWILIO_ACCOUNT_SID      # optional
firebase functions:secrets:set TWILIO_AUTH_TOKEN     # optional
firebase functions:secrets:set TWILIO_FROM_NUMBER    # optional
firebase functions:secrets:set SOCIAL_NOTIFY_PHONE     # optional
```

Set env for your project:

```bash
export FIREBASE_STORAGE_BUCKET=your-project.appspot.com
export FIRESTORE_DATABASE_ID=(default)   # or named DB id
```

Deploy:

```bash
firebase deploy --only functions,firestore:rules,firestore:indexes
```

### 3. Admin UI

```bash
cd admin
npm ci
cp .env.example .env.local   # set VITE_SOCIAL_API_URL
npm run dev
```

Open http://localhost:5174 — enter `SOCIAL_ADMIN_API_KEY`, click **Generate today**.

### 4. Scheduler

`socialPostScheduler` runs daily at **7:00 AM Pacific**. Adjust in `functions/index.js`.

## API

HTTP function `socialPosts` (same actions as ManyDoors `pmSocialPosts`):

- `GET ?action=list`
- `GET ?action=config`
- `POST { action: 'generate', force?: boolean }`
- `POST { action: 'approve' | 'reject' | 'markPosted' | 'update' | 'resendNotify' | 'testSms' | 'updateConfig', ... }`

Auth header: `X-Social-Admin-Key`

## ManyDoors integration

To keep using this inside manydoorsai.com, the original integration lives in:

- `src/developer-admin/SocialPostsPanel.jsx`
- `functions/lib/socialPost*.js`
- Developer Admin → **Social posts** tab

This folder is the **portable copy** for AiBhive and other projects.
