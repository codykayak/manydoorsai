/**
 * Client for the pmOps Cloud Function — tenant cloud sync + Twilio dispatch.
 */

const DEFAULT_URL =
  'https://us-central1-property-managment-a5ed3.cloudfunctions.net/pmOps';

const KEY_STORAGE = 'pm:ops:adminKey';

export function getOpsApiUrl() {
  return (import.meta.env.VITE_PM_OPS_API_URL || DEFAULT_URL).replace(/\/$/, '');
}

export function getStoredOpsKey() {
  try {
    return sessionStorage.getItem(KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function setStoredOpsKey(key) {
  try {
    if (key) sessionStorage.setItem(KEY_STORAGE, key);
    else sessionStorage.removeItem(KEY_STORAGE);
  } catch {
    /* ignore */
  }
}

async function request(body) {
  const key = getStoredOpsKey();
  if (!key) {
    const err = new Error('Enter your Ops Admin API key in Settings → Persistence to enable cloud sync and live SMS.');
    err.code = 'missing_key';
    throw err;
  }

  const res = await fetch(getOpsApiUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Ops-Admin-Key': key,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Ops request failed (${res.status})`);
    err.code = data.code || 'ops_error';
    throw err;
  }
  return data;
}

/** Persist a full tenant snapshot to Firestore (Admin SDK). */
export function syncTenantSnapshot(tenantId, snapshot) {
  return request({ action: 'sync', tenantId, snapshot });
}

/** Load the latest cloud snapshot for a tenant. */
export function loadTenantSnapshot(tenantId) {
  return request({ action: 'load', tenantId });
}

/** Send a real Twilio SMS for maintenance dispatch. */
export function notifyDispatch({ to, body, workOrderId, unit }) {
  return request({ action: 'dispatch', to, body, workOrderId, unit });
}

/** Check whether Twilio secrets are configured on the server. */
export function twilioHealth() {
  return request({ action: 'twilioHealth' });
}
