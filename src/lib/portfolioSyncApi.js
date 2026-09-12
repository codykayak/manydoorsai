/**
 * Portfolio sync client — staff use Google sign-in; machines use the GCP secret.
 */

import APP_CONFIG from '../config/appConfig';
import { getIdToken } from './pmAuth';

const DEFAULT_URL =
  'https://us-central1-property-managment-a5ed3.cloudfunctions.net/pmPortfolioSync';

export function getPortfolioSyncUrl() {
  return (import.meta.env.VITE_PM_PORTFOLIO_SYNC_URL || DEFAULT_URL).replace(/\/$/, '');
}

async function authHeaders() {
  const token = await getIdToken();
  if (!token) throw new Error('Sign in with Google to view or configure nightly sync.');
  return { Authorization: `Bearer ${token}` };
}

async function request(method, { action, body, query, file, tenantId } = {}) {
  const url = new URL(getPortfolioSyncUrl());
  if (action) url.searchParams.set('action', action);
  if (query) {
    for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  }

  const headers = await authHeaders();
  headers['X-Tenant-Id'] = tenantId || APP_CONFIG.defaultTenantId;

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

/** Pull the latest portfolio snapshot (Google sign-in). */
export async function fetchLatestPortfolio(tenantId) {
  return request('GET', {
    action: 'latest',
    query: { tenantId: tenantId || APP_CONFIG.defaultTenantId },
    tenantId,
  });
}

export async function fetchSyncStatus(tenantId) {
  return request('GET', {
    action: 'status',
    query: { tenantId: tenantId || APP_CONFIG.defaultTenantId },
    tenantId,
  });
}

/** Build a Windows installer script for this tenant's folder + schedule. */
export function buildSyncInstallerBat({ tenantId, exportFolder, scheduleTime = '18:15' }) {
  const folder = exportFolder || 'C:\\YardiExports';
  const [hour, minute] = scheduleTime.split(':');
  return `@echo off
REM ManyDoors AI — nightly PMS export uploader
REM Tenant: ${tenantId}
REM Folder: ${folder}
REM Schedule: daily at ${scheduleTime}

set TENANT_ID=${tenantId}
set EXPORT_DIR=${folder}
set PORTFOLIO_SYNC_API_KEY=PASTE_YOUR_SECRET_MANAGER_KEY_HERE

cd /d "%~dp0\\..\\.."
schtasks /Create /TN "ManyDoors PMS Sync" /TR "cmd /c cd /d %~dp0\\..\\.. && set TENANT_ID=${tenantId}&& set EXPORT_DIR=${folder}&& set PORTFOLIO_SYNC_API_KEY=%PORTFOLIO_SYNC_API_KEY%&& node scripts\\nightly-pms-export-upload.mjs" /SC DAILY /ST ${hour}:${minute} /F

echo Scheduled nightly upload at ${scheduleTime}. Edit PORTFOLIO_SYNC_API_KEY in Task Scheduler env or setx before first run.
pause
`;
}
