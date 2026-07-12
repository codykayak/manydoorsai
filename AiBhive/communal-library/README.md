# Communal Library expansion pack

Public-domain seed plates for **10 categories × 10 items** on [aibhive.com/research-lab/communal-library](https://aibhive.com/research-lab/communal-library).

## Categories included

| Topic ID | Label | Items |
|----------|-------|------:|
| `hieroglyphics` | Hieroglyphics | 10 |
| `cuneiform` | Cuneiform | 10 |
| `mud-flood` | Mud Flood | 10 |
| `tartarian` | Tartarian | 10 |
| `orphan-trains` | Orphan Trains (orphans + trains) | 10 |
| `legal-research` | Legal Research | 10 |
| `homeopathic` | Homeopathic Cures | 10 |
| `mycology` | Mycology | 10 |
| `quantum` | Quantum Physics | 10 |

## Install into AiBhive

1. **Copy images** into the AiBhive static root:

   ```bash
   cp -r AiBhive/communal-library/public/communal-archive/* /path/to/AiBhive/public/communal-archive/
   ```

2. **Replace seed data** in the Research Lab archive page. Either:
   - Import `communalLibrarySeed.js` and use `COMMUNAL_LIBRARY_SEED` instead of the inline `K` array in `CommunalArchiveTopicPage`, **or**
   - Merge the new entries from `communalLibrarySeed.js` into the existing seed array.

   Example import pattern:

   ```js
   import { COMMUNAL_LIBRARY_SEED, archiveImagePath } from '@/data/communalLibrarySeed.js';

   function seedItemsForTopic(topicId) {
     return COMMUNAL_LIBRARY_SEED.filter((item) => item.topicId === topicId);
   }
   ```

3. **Optional — bump topic doc counts** in `communalLibraryTopics.js` (example):

   ```js
   { id: 'hieroglyphics', docs: 1842, ... }  // was 1842; live + seed counts update via API
   ```

4. **Rebuild and deploy** AiBhive (Cloud Run / hosting pipeline).

## Regenerate images

```bash
node scripts/fetch-communal-archive-images.mjs
# single topic:
node scripts/fetch-communal-archive-images.mjs --topic hieroglyphics
```

Image filenames are listed in `imageSources.json`. Sources are Wikimedia Commons (public domain / CC) unless noted in each item's `sourceUrl`.

## Files

| Path | Purpose |
|------|---------|
| `src/data/communalLibrarySeed.js` | 90 seed plate records with titles, creators, excerpts |
| `public/communal-archive/{topic}/{1-10}.jpg` | Archive thumbnail images |
| `imageSources.json` | Wikimedia filename manifest for the fetch script |

## Notes

- **Orphans + trains**: the live library uses one topic node, `orphan-trains`, covering both orphan-train history and transcontinental rail plates.
- Seed plates display as **“seed”** in the archive UI; community publishes appear as **“live”** via `/api/research-lab/fable-scrape/library`.
- First two images per topic match the existing production plates where possible (`--from-live` in the fetch script).
