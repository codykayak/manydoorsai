/**
 * Firestore persistence for portfolio / rent-roll nightly sync.
 */

import { createHash, timingSafeEqual } from 'crypto';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { parseRentRollRows, buildImportSummary } from '../../shared/rentRollParse.js';

const DB_ID = process.env.FIRESTORE_DATABASE_ID || 'property-managment';

function db() {
  return getFirestore(DB_ID);
}

function portfolioDoc(tenantId) {
  return db().doc(`tenants/${tenantId}/portfolio/current`);
}

function historyCol(tenantId) {
  return db().collection(`tenants/${tenantId}/portfolio/history`);
}

export function safeCompareKeys(provided, expected) {
  if (!provided || !expected) return false;
  const a = createHash('sha256').update(provided).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

function genId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function ingestRentRollRows(rows, { fileName, source, tenantId }) {
  const parsed = parseRentRollRows(rows, { genId, fileName, source });
  const snapshot = {
    importedAt: Date.now(),
    fileName: fileName || '',
    source: source || 'nightly-sync',
    category: parsed.category,
    summaryText: buildImportSummary(parsed),
    summary: parsed.summary,
    properties: parsed.properties,
    units: parsed.units,
    residents: parsed.residents,
    tenantId,
  };
  return snapshot;
}

export async function savePortfolioSnapshot(tenantId, snapshot) {
  const ref = portfolioDoc(tenantId);
  await ref.set({
    ...snapshot,
    updatedAt: Timestamp.now(),
  });
  await historyCol(tenantId).add({
    fileName: snapshot.fileName,
    source: snapshot.source,
    summaryText: snapshot.summaryText,
    summary: snapshot.summary,
    importedAt: snapshot.importedAt,
    createdAt: Timestamp.now(),
  });
  return snapshot;
}

export async function getLatestPortfolio(tenantId) {
  const snap = await portfolioDoc(tenantId).get();
  if (!snap.exists) return null;
  return snap.data();
}

export async function getSyncStatus(tenantId) {
  const latest = await getLatestPortfolio(tenantId);
  const histSnap = await historyCol(tenantId).orderBy('createdAt', 'desc').limit(10).get();
  const history = histSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return {
    tenantId,
    lastImportAt: latest?.importedAt || null,
    lastFileName: latest?.fileName || null,
    summary: latest?.summary || null,
    history: history.map((h) => ({
      id: h.id,
      fileName: h.fileName,
      importedAt: h.importedAt,
      summaryText: h.summaryText,
      source: h.source,
    })),
  };
}

export function tenantPropertiesFromSnapshot(snapshot) {
  return (snapshot.properties || []).map((p) => ({
    id: p.id,
    name: p.name,
    units: p.units,
    occupied: p.occupied,
    vacant: p.vacant,
    notice: p.notice,
    city: '',
    state: 'OR',
  }));
}
