/**
 * Portfolio snapshot — rent-roll derived properties, units, and KPIs.
 * Persisted per-tenant in localStorage; synced from Cloud Functions when configured.
 */

import { genId } from '../data/store';

/** @typedef {import('../../shared/rentRollParse.js').parseRentRollRows} RentRollParse */

/**
 * @typedef {Object} PortfolioSnapshot
 * @property {number} importedAt
 * @property {string} fileName
 * @property {string} source
 * @property {string} category
 * @property {string} summaryText
 * @property {object} summary
 * @property {object[]} properties
 * @property {object[]} units
 */

export function emptyPortfolioSnapshot() {
  return {
    importedAt: 0,
    fileName: '',
    source: '',
    category: '',
    summaryText: '',
    summary: {
      totalUnits: 0, occupied: 0, vacant: 0, notice: 0,
      delinquentCount: 0, delinquentTotal: 0, grossRent: 0,
    },
    properties: [],
    units: [],
  };
}

export function buildSnapshotFromImport(parsed) {
  return {
    importedAt: parsed.importedAt || Date.now(),
    fileName: parsed.fileName || '',
    source: parsed.source || 'manual-drop',
    category: parsed.category || 'Rent Roll',
    summaryText: parsed.summaryText || '',
    summary: parsed.summary,
    properties: parsed.properties,
    units: parsed.units,
  };
}

/** Vacant / notice units for the vacancy tracker, longest vacant first. */
export function deriveVacantUnits(snapshot) {
  if (!snapshot?.units?.length) return [];
  return snapshot.units
    .filter((u) => u.status === 'vacant' || u.status === 'notice')
    .map((u) => ({
      unit: u.unit,
      property: u.propertyName,
      propertyId: u.propertyId,
      daysVacant: u.daysVacant || (u.status === 'notice' ? 0 : 14),
      status: u.status === 'notice' ? 'notice' : (u.daysVacant >= 7 ? 'listed' : 'make-ready'),
      rent: u.rent || 0,
    }))
    .sort((a, b) => b.daysVacant - a.daysVacant);
}

/** Merge imported properties into tenant settings shape. */
export function mergeTenantProperties(existing = [], imported = []) {
  const byName = new Map((existing || []).map((p) => [p.name?.toLowerCase(), p]));
  return imported.map((p) => {
    const prev = byName.get(p.name?.toLowerCase());
    return {
      id: prev?.id || p.id,
      name: p.name,
      units: p.units,
      city: prev?.city || '',
      state: prev?.state || 'OR',
      occupied: p.occupied,
      vacant: p.vacant,
      notice: p.notice,
    };
  });
}

/**
 * Upsert residents from a rent-roll import.
 * Matches on unit + property (or name + unit as fallback).
 */
export function mergeResidents(existing = [], imported = [], { upsert = true } = {}) {
  if (!upsert) {
    const seen = new Set(existing.map((r) => residentKey(r)));
    const merged = [...existing];
    for (const r of imported) {
      const k = residentKey(r);
      if (!seen.has(k)) {
        merged.push({ ...r, createdAt: Date.now() });
        seen.add(k);
      }
    }
    return merged;
  }

  const byKey = new Map(existing.map((r) => [residentKey(r), r]));
  for (const r of imported) {
    const k = residentKey(r);
    const prev = byKey.get(k);
    if (prev) {
      byKey.set(k, {
        ...prev,
        ...r,
        id: prev.id,
        createdAt: prev.createdAt,
        updatedAt: Date.now(),
      });
    } else {
      byKey.set(k, { ...r, id: r.id || genId('res'), createdAt: Date.now() });
    }
  }
  return [...byKey.values()];
}

function residentKey(r) {
  const prop = (r.property || '').toLowerCase();
  const unit = (r.unit || '').toLowerCase();
  if (unit && prop) return `${prop}|${unit}`;
  return `${(r.name || '').toLowerCase()}|${unit}`;
}

/** Live occupancy KPIs for owner portal when rent roll is synced. */
export function liveOccupancyKpis(snapshot) {
  if (!snapshot?.summary?.totalUnits) return null;
  const { totalUnits, occupied, vacant, notice, delinquentCount, delinquentTotal, grossRent } = snapshot.summary;
  const vacancyRate = totalUnits ? (vacant + notice * 0.5) / totalUnits : 0;
  const delinquencyRate = totalUnits ? delinquentCount / totalUnits : 0;
  return {
    totalUnits,
    occupied,
    vacant,
    notice,
    vacancyRate,
    delinquencyRate,
    delinquentTotal,
    grossRent,
    renewalRate: null,
  };
}
