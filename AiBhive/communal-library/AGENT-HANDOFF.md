# AiBhive agent handoff — Communal Library merge

Use this when running a **Cloud Agent on the AiBhive repo** (not manydoorsai).

## Source of truth

Content lives on **manydoorsai** branch `cursor/communal-library-expansion-b06f` (PR #7):

| Asset | URL |
|-------|-----|
| Zip (fastest) | https://github.com/codykayak/manydoorsai/raw/cursor/communal-library-expansion-b06f/downloads/communal-library.zip |
| Seed JS | https://github.com/codykayak/manydoorsai/raw/cursor/communal-library-expansion-b06f/AiBhive/communal-library/src/data/communalLibrarySeed.js |
| Images tree | https://github.com/codykayak/manydoorsai/tree/cursor/communal-library-expansion-b06f/AiBhive/communal-library/public/communal-archive |

90 items × 9 topics (10 each): hieroglyphics, cuneiform, mud-flood, tartarian, orphan-trains, legal-research, homeopathic, mycology, quantum.

## What the AiBhive agent should do

### 1. Pull the pack

```bash
curl -L -o /tmp/communal-library.zip \
  https://github.com/codykayak/manydoorsai/raw/cursor/communal-library-expansion-b06f/downloads/communal-library.zip
unzip -o /tmp/communal-library.zip -d /tmp/communal-library
```

### 2. Copy images into AiBhive static assets

```bash
mkdir -p public/communal-archive
cp -r /tmp/communal-library/public/communal-archive/* public/communal-archive/
```

Expected result: `public/communal-archive/{topic}/1.jpg` … `{topic}/10.jpg` for all 9 topics above.

### 3. Add seed data module

Copy seed file into the AiBhive source tree (adjust path to match repo conventions):

```bash
cp /tmp/communal-library/src/data/communalLibrarySeed.js src/data/communalLibrarySeed.js
```

### 4. Wire into CommunalArchiveTopicPage

Find the archive topic page (production bundle: `CommunalArchiveTopicPage`). It currently has an inline seed array (`K`) with **2 items per topic**.

**Preferred:** replace inline array with import:

```js
import {
  COMMUNAL_LIBRARY_SEED,
  seedItemsForTopic,
} from '@/data/communalLibrarySeed.js';

// Replace: function A(i){return K.filter(...)}
// With:
function A(topicId) {
  return seedItemsForTopic(topicId);
}
```

If the page maps seed items through a normalizer (e.g. `X(i)` adding `live: false`), keep that wrapper — only change where seed rows come from.

**Alternative:** paste all 90 entries from `communalLibrarySeed.js` into the existing inline array if the repo doesn't use shared data modules yet.

### 5. Verify locally

```bash
npm ci && npm run build
# Spot-check built assets include public/communal-archive/hieroglyphics/10.jpg
# Dev: open /research-lab/communal-library/hieroglyphics — should list 10 seed plates
```

### 6. Commit, PR, deploy

```bash
git checkout -b cursor/communal-library-live-b06f
git add public/communal-archive src/data/communalLibrarySeed.js src/**/CommunalArchive*
git commit -m "feat: expand Communal Library to 10 seed plates per topic"
git push -u origin cursor/communal-library-live-b06f
```

Open PR → merge → run AiBhive deploy (Cloud Run / Cloud Build trigger on `main`).

### 7. Production smoke test

```bash
curl -sI https://aibhive.com/communal-archive/hieroglyphics/10.jpg | head -3
# Expect: content-type: image/jpeg (not HTML SPA fallback)

curl -sL "https://aibhive.com/research-lab/communal-library/hieroglyphics" | rg -c hieroglyphics-10 || true
```

Browse: https://aibhive.com/research-lab/communal-library/hieroglyphics — grid should show **10 seed** items.

## Copy-paste prompt for a new AiBhive agent

```
Merge the Communal Library expansion into this AiBhive repo and deploy.

Source pack (manydoorsai PR #7):
https://github.com/codykayak/manydoorsai/raw/cursor/communal-library-expansion-b06f/downloads/communal-library.zip

Follow AiBhive/communal-library/AGENT-HANDOFF.md (or the handoff doc in the zip README):
1. Unzip and copy public/communal-archive/* → public/communal-archive/
2. Add src/data/communalLibrarySeed.js
3. Wire COMMUNAL_LIBRARY_SEED into CommunalArchiveTopicPage (replace inline 2-item seed array)
4. Build, commit, push branch cursor/communal-library-live-b06f, open PR, merge, deploy
5. Verify https://aibhive.com/communal-archive/hieroglyphics/10.jpg returns a real JPEG and the hieroglyphics archive shows 10 items

Topics: hieroglyphics, cuneiform, mud-flood, tartarian, orphan-trains, legal-research, homeopathic, mycology, quantum (10 items each).
```

## Why two repos?

- **manydoorsai** — staging/export repo (this pack was built here; PR #7).
- **AiBhive** — private repo that builds **aibhive.com**. Only an agent with AiBhive checked out can merge + deploy to production.
