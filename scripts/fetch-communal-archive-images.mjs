#!/usr/bin/env node
/**
 * Fetch public-domain Communal Library archive images from Wikimedia Commons.
 * Outputs JPEGs to public/communal-archive/{topicId}/{index}.jpg
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', 'AiBhive', 'communal-library');
const OUT = path.join(ROOT, 'public', 'communal-archive');
const MANIFEST = path.join(ROOT, 'imageSources.json');
const LIVE_BASE = 'https://aibhive.com/communal-archive';
const UA = 'AiBhive-CommunalLibrary/1.0 (https://aibhive.com; research archive bot)';

const args = process.argv.slice(2);
const topicFilter = args.includes('--topic') ? args[args.indexOf('--topic') + 1] : null;
const fromLive = !args.includes('--no-live');

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function filePathUrl(filename) {
  const name = decodeURIComponent(filename.replace(/^File:/, ''));
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=960`;
}

async function fetchWithRetry(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': UA },
    });
    if (res.status === 429) {
      await sleep(1500 * (i + 1));
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('image') && !ct.includes('octet-stream')) {
      throw new Error(`Not an image (${ct})`);
    }
    return Buffer.from(await res.arrayBuffer());
  }
  throw new Error('Rate limited');
}

async function downloadOne(topicId, index, filename) {
  const dir = path.join(OUT, topicId);
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, `${index}.jpg`);

  if (fromLive && Number(index) <= 2) {
    const liveUrl = `${LIVE_BASE}/${topicId}/${index}.jpg`;
    try {
      const buf = await fetchWithRetry(liveUrl);
      fs.writeFileSync(dest, buf);
      console.log(`  ✓ ${topicId}/${index}.jpg (live)`);
      return;
    } catch {
      /* fall through to Commons */
    }
  }

  const url = filePathUrl(filename);
  const buf = await fetchWithRetry(url);
  fs.writeFileSync(dest, buf);
  console.log(`  ✓ ${topicId}/${index}.jpg ← ${filename}`);
}

async function main() {
  console.log(`Communal Library image fetch → ${OUT}`);
  const topics = topicFilter ? { [topicFilter]: manifest[topicFilter] } : manifest;
  if (topicFilter && !topics[topicFilter]) {
    console.error(`Unknown topic: ${topicFilter}`);
    process.exit(1);
  }

  for (const [topicId, files] of Object.entries(topics)) {
    console.log(`\n${topicId}:`);
    for (const [index, filename] of Object.entries(files)) {
      try {
        await downloadOne(topicId, index, filename);
      } catch (err) {
        console.error(`  ✗ ${topicId}/${index}: ${err.message}`);
      }
      await sleep(800);
    }
  }
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
