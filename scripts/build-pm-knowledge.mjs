#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { buildSiteKnowledgeText } from '../src/content/siteKnowledge.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'functions/data');
const outFile = join(outDir, 'pm-knowledge.txt');

mkdirSync(outDir, { recursive: true });
const text = buildSiteKnowledgeText();
writeFileSync(outFile, text, 'utf8');
console.log(`[build-pm-knowledge] wrote ${text.length.toLocaleString()} chars → functions/data/pm-knowledge.txt`);
