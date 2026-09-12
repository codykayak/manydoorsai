#!/usr/bin/env node
/**
 * Nightly PMS export uploader — run after Yardi / RealPage / AppFolio CSV lands.
 *
 * Environment:
 *   PORTFOLIO_SYNC_API_KEY  — required (matches Firebase secret)
 *   PORTFOLIO_SYNC_URL      — optional (defaults to production function)
 *   TENANT_ID               — optional (default: demo)
 *   EXPORT_FILE             — path to CSV/XLSX (or set EXPORT_DIR to upload newest file)
 *   EXPORT_DIR              — directory to watch for newest .csv/.xlsx
 *
 * Windows Task Scheduler example (daily 6:15 PM):
 *   Program: node
 *   Arguments: C:\path\to\manydoorsai\scripts\nightly-pms-export-upload.mjs
 *   Start in: C:\path\to\manydoorsai
 */

import { readFile, readdir, stat } from 'fs/promises';
import { join, extname } from 'path';

const DEFAULT_URL =
  'https://us-central1-property-managment-a5ed3.cloudfunctions.net/pmPortfolioSync';

const apiKey = process.env.PORTFOLIO_SYNC_API_KEY;
const syncUrl = (process.env.PORTFOLIO_SYNC_URL || DEFAULT_URL).replace(/\/$/, '');
const tenantId = process.env.TENANT_ID || 'demo';

if (!apiKey) {
  console.error('Missing PORTFOLIO_SYNC_API_KEY');
  process.exit(1);
}

async function findNewestExport(dir) {
  const entries = await readdir(dir);
  const candidates = [];
  for (const name of entries) {
    const ext = extname(name).toLowerCase();
    if (!['.csv', '.xlsx', '.xls', '.xlsm'].includes(ext)) continue;
    const full = join(dir, name);
    const s = await stat(full);
    if (s.isFile()) candidates.push({ full, mtime: s.mtimeMs, name });
  }
  candidates.sort((a, b) => b.mtime - a.mtime);
  return candidates[0] || null;
}

async function resolveFile() {
  if (process.env.EXPORT_FILE) return { path: process.env.EXPORT_FILE, name: process.env.EXPORT_FILE.split(/[/\\]/).pop() };
  if (process.env.EXPORT_DIR) {
    const newest = await findNewestExport(process.env.EXPORT_DIR);
    if (!newest) throw new Error(`No CSV/XLSX found in ${process.env.EXPORT_DIR}`);
    return { path: newest.full, name: newest.name };
  }
  throw new Error('Set EXPORT_FILE or EXPORT_DIR');
}

async function main() {
  const { path, name } = await resolveFile();
  const body = await readFile(path);
  const ext = extname(name).toLowerCase();
  const contentType = ext === '.csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  console.log(`Uploading ${name} (${body.length} bytes) → ${syncUrl}`);

  const res = await fetch(syncUrl, {
    method: 'POST',
    headers: {
      'X-Portfolio-Sync-Key': apiKey,
      'X-Tenant-Id': tenantId,
      'X-File-Name': name,
      'Content-Type': contentType,
    },
    body,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('Upload failed:', data.error || res.statusText);
    process.exit(1);
  }

  console.log('OK:', data.summaryText || JSON.stringify(data.summary));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
