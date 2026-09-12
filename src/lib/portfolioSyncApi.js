/**
 * Client for pmPortfolioSync — nightly PMS export upload + pull latest snapshot.
 */

import APP_CONFIG from '../config/appConfig';

const DEFAULT_URL =
  'https://us-central1-property-managment-a5ed3.cloudfunctions.net/pmPortfolioSync';

const STORAGE_KEY = 'pm:portfolio:syncKey';

export function getPortfolioSyncUrl() {
  return (import.meta.env.VITE_PM_PORTFOLIO_SYNC_URL || DEFAULT_URL).replace(/\/$/, '');
}

export function getStoredSyncKey() {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredSyncKey(key) {
  try {
    if (key) localStorage.setItem(STORAGE_KEY, key);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

async function request(method, { action, body, query, file } = {}) {
  const key = getStoredSyncKey();
  if (!key) throw new Error('Enter your Portfolio Sync API key in Settings → PMS nightly sync.');

  const url = new URL(getPortfolioSyncUrl());
  if (action) url.searchParams.set('action', action);
  if (query) {
    for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  }

  const headers = {
    'X-Portfolio-Sync-Key': key,
    'X-Tenant-Id': APP_CONFIG.defaultTenantId,
  };

  let fetchBody = body;
  if (file) {
    fetchBody = file;
    headers['Content-Type'] = file.type || 'text/csv';
    headers['X-File-Name'] = file.name;
  } else if (body && !(body instanceof Blob)) {
    headers['Content-Type'] = 'application/json';
    fetchBody = JSON.stringify(body);
  }

  const res = await fetch(url.toString(), { method, headers, body: fetchBody });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Sync failed (${res.status})`);
  return data;
}

/** Upload a rent-roll file to the server (same as nightly listener). */
export async function uploadPortfolioFile(file) {
  return request('POST', { file });
}

/** Pull the latest portfolio snapshot from Firestore. */
export async function fetchLatestPortfolio() {
  return request('GET', {
    action: 'latest',
    query: { tenantId: APP_CONFIG.defaultTenantId },
  });
}

/** Get sync status and ingest history. */
export async function fetchSyncStatus() {
  return request('GET', {
    action: 'status',
    query: { tenantId: APP_CONFIG.defaultTenantId },
  });
}
