#!/usr/bin/env node
/** Resolve Wikimedia Commons filenames for seed items via search API (slow, run once). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(__dirname, '..', 'AiBhive', 'communal-library', 'src', 'data', 'communalLibrarySeed.js');
const outPath = path.join(__dirname, '..', 'AiBhive', 'communal-library', 'imageSources.json');

const UA = 'AiBhive-CommunalLibrary/1.0 (https://aibhive.com)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const seedMod = await import(`file://${seedPath}`);
const items = seedMod.COMMUNAL_LIBRARY_SEED;

async function searchFile(query) {
  const api = new URL('https://commons.wikimedia.org/w/api.php');
  api.searchParams.set('action', 'query');
  api.searchParams.set('format', 'json');
  api.searchParams.set('list', 'search');
  api.searchParams.set('srsearch', query);
  api.searchParams.set('srnamespace', '6');
  api.searchParams.set('srlimit', '3');
  const res = await fetch(api, { headers: { 'User-Agent': UA } });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  const hit = data?.query?.search?.[0]?.title?.replace(/^File:/, '');
  return hit || null;
}

async function verify(name) {
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=320`;
  const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' });
  const ct = res.headers.get('content-type') || '';
  return res.ok && ct.includes('image');
}

const manifest = {};
for (const item of items) {
  if (!manifest[item.topicId]) manifest[item.topicId] = {};
  const idx = item.id.split('-').pop();
  const query = item.title.replace(/[—–-].*$/, '').replace(/[^\w\s]/g, ' ').trim();
  process.stdout.write(`${item.topicId}/${idx} "${query}" … `);
  await sleep(1200);
  const file = await searchFile(query);
  if (file && (await verify(file))) {
    manifest[item.topicId][idx] = file;
    console.log(file);
  } else {
    console.log('MISS');
  }
}

fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\nWrote ${outPath}`);
