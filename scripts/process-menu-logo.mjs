#!/usr/bin/env node
/**
 * Crop menu logo JPG, remove fake checkerboard, lighten dark text for dark navbar.
 * Output: public/manydoors-ai-logo-menu.png
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'public/manydoors-ai-logo-menu-property-managment.jpg');
const out = path.join(root, 'public/manydoors-ai-logo-menu.png');

const CHECKER_LIGHT = [245, 245, 245];
const CHECKER_DARK = [204, 204, 204];
const TOLERANCE = 28;

function isChecker(r, g, b) {
  const near = (a, b) => Math.abs(a - b) <= TOLERANCE;
  const light = near(r, CHECKER_LIGHT[0]) && near(g, CHECKER_LIGHT[1]) && near(b, CHECKER_LIGHT[2]);
  const dark = near(r, CHECKER_DARK[0]) && near(g, CHECKER_DARK[1]) && near(b, CHECKER_DARK[2]);
  return light || dark;
}

function lightenText(r, g, b) {
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  if (lum < 95) {
    const t = 0.72;
    return [
      Math.round(r + (230 - r) * t),
      Math.round(g + (237 - g) * t),
      Math.round(b + (243 - b) * t),
    ];
  }
  return [r, g, b];
}

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

for (let i = 0; i < data.length; i += channels) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  if (isChecker(r, g, b)) {
    data[i + 3] = 0;
  } else {
    const [lr, lg, lb] = lightenText(r, g, b);
    data[i] = lr;
    data[i + 1] = lg;
    data[i + 2] = lb;
  }
}

const trimmed = await sharp(data, { raw: { width, height, channels } })
  .trim({ threshold: 1 })
  .png()
  .toBuffer();

const meta = await sharp(trimmed).metadata();
await sharp(trimmed).png({ compressionLevel: 9 }).toFile(out);

console.log(`[process-menu-logo] wrote ${path.relative(root, out)} (${meta.width}x${meta.height})`);
