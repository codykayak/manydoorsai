#!/usr/bin/env node
/**
 * Generate ultra high-tech page backdrops via xAI Grok image API.
 * Saves JPEGs to public/bg/page-*.jpg
 *
 * Usage:
 *   XAI_API_KEY=... npm run generate:bg
 *   (auto-loads key from ../aibhive-main-fixed/.env.local when unset)
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'public', 'bg');
const XAI_BASE = 'https://api.x.ai/v1';

const IMAGE_MODELS = [
  process.env.GROK_IMAGE_MODEL,
  'grok-imagine-image-quality',
  'grok-imagine-image',
].filter(Boolean);

const PAGES = [
  {
    id: 'overview',
    file: 'page-overview.jpg',
    prompt:
      'Ultra high-tech dark abstract background for an enterprise AI SaaS platform overview. Deep navy black, glowing cyan teal #00d2d3 accents, subtle hexagonal grid and light trails, glass morphism depth, cinematic wide composition, no text, no logos, no people, 8k wallpaper style',
  },
  {
    id: 'savings',
    file: 'page-savings.jpg',
    prompt:
      'Futuristic financial analytics background for property management ROI savings page. Dark background, abstract glowing cyan charts, coin and upward trend motifs as holographic nodes, data visualization aesthetic, teal accents, no text, no logos, cinematic 16:9',
  },
  {
    id: 'faq',
    file: 'page-faq.jpg',
    prompt:
      'High-tech knowledge base background for FAQ help center. Neural network nodes and connecting lines, dark navy with cyan teal glow, holographic question-answer motif abstract, clean enterprise tech, no text, no logos, wide cinematic',
  },
  {
    id: 'pros',
    file: 'page-pros.jpg',
    prompt:
      'Field service trades technology background for HVAC plumbing electrical pros software. Dark industrial tech aesthetic, abstract holographic tools and dispatch nodes, cyan teal accents, rugged professional vibe, no text, no logos, wide cinematic',
  },
  {
    id: 'features',
    file: 'page-features.jpg',
    prompt:
      'Smart multifamily property management AI background. Abstract apartment building silhouette with IoT sensor nodes and AI neural glow, dark with cyan teal highlights, proptech futuristic, no text, no logos, wide cinematic wallpaper',
  },
];

async function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const raw = await readFile(filePath, 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function resolveApiKey() {
  return process.env.XAI_API_KEY || process.env.GROK_API_KEY || '';
}

async function generateImage(apiKey, model, prompt) {
  const res = await fetch(`${XAI_BASE}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      aspect_ratio: '16:9',
      response_format: 'b64_json',
      n: 1,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || `xAI image API error (${res.status})`);
  }

  const b64 = data.data?.[0]?.b64_json;
  if (b64) return Buffer.from(b64, 'base64');

  const url = data.data?.[0]?.url;
  if (url) {
    const imgRes = await fetch(url);
    if (!imgRes.ok) throw new Error('Failed to download image URL from xAI.');
    return Buffer.from(await imgRes.arrayBuffer());
  }

  throw new Error('No image returned from xAI.');
}

async function generateWithFallback(apiKey, prompt) {
  let lastErr;
  for (const model of [...new Set(IMAGE_MODELS)]) {
    try {
      console.log(`[generate:bg] model=${model}`);
      const buf = await generateImage(apiKey, model, prompt);
      return buf;
    } catch (e) {
      lastErr = e;
      console.warn(`[generate:bg] ${model} failed: ${e.message}`);
    }
  }
  throw lastErr || new Error('All image models failed');
}

async function main() {
  const envLocal = path.join(root, '..', 'aibhive-main-fixed', '.env.local');
  await loadEnvFile(envLocal);

  const apiKey = resolveApiKey();
  if (!apiKey) {
    console.error('[generate:bg] Set XAI_API_KEY or GROK_API_KEY (or add to ../aibhive-main-fixed/.env.local)');
    process.exit(1);
  }

  await mkdir(outDir, { recursive: true });

  for (const page of PAGES) {
    const dest = path.join(outDir, page.file);
    console.log(`[generate:bg] ${page.id} → public/bg/${page.file}`);
    const buf = await generateWithFallback(apiKey, page.prompt);
    await writeFile(dest, buf);
    console.log(`[generate:bg] wrote ${(buf.length / 1024).toFixed(0)} KB`);
  }

  console.log('[generate:bg] done — 5 backgrounds in public/bg/');
}

main().catch((e) => {
  console.error('[generate:bg] fatal:', e.message);
  process.exit(1);
});
