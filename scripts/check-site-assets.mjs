#!/usr/bin/env node
/**
 * Fail the build if required public assets are missing (prevents empty pitch video on deploy).
 */
import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'public/manydoors-ai-property-managment-automation.mp4',
  'public/manydoors-ai_property-management-realestate.mp4',
];

let failed = false;
for (const rel of required) {
  const abs = path.join(root, rel);
  try {
    await access(abs, constants.R_OK);
    console.log(`[check-site-assets] ok ${rel}`);
  } catch {
    console.error(`[check-site-assets] MISSING ${rel}`);
    failed = true;
  }
}

if (failed) process.exit(1);
