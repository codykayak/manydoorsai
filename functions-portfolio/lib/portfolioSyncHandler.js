import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { setCors } from './cors.js';

if (!getApps().length) {
  initializeApp({
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'property-managment-a5ed3.firebasestorage.app',
  });
}
import { parseSpreadsheetBuffer } from './spreadsheetParse.js';
import {
  safeCompareKeys,
  ingestRentRollRows,
  savePortfolioSnapshot,
  getLatestPortfolio,
  getSyncStatus,
  tenantPropertiesFromSnapshot,
} from './portfolioStore.js';

const DB_ID = process.env.FIRESTORE_DATABASE_ID || 'property-managment';

function db() {
  return getFirestore(DB_ID);
}

/** Machine upload (nightly agent) — GCP Secret Manager key. */
function checkSyncKey(req) {
  const expected = process.env.PORTFOLIO_SYNC_API_KEY;
  if (!expected) {
    return { ok: false, error: 'PORTFOLIO_SYNC_API_KEY is not configured on the server.' };
  }
  const provided = req.get('X-Portfolio-Sync-Key') || req.get('x-portfolio-sync-key') || '';
  if (!safeCompareKeys(provided, expected)) {
    return { ok: false, error: 'Invalid portfolio sync API key.' };
  }
  return { ok: true, mode: 'api-key' };
}

/** Staff browser or setup agent — Firebase Google sign-in. */
async function checkFirebaseAuth(req) {
  const header = req.get('Authorization') || req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return { ok: false };
  try {
    const decoded = await getAuth().verifyIdToken(token);
    const uid = decoded.uid;
    const index = await db().doc(`userTenants/${uid}`).get();
    const tenantId = index.exists
      ? (index.data()?.tenantId || index.data()?.defaultTenantId)
      : null;
    const memberRef = tenantId
      ? db().doc(`tenants/${tenantId}/members/${uid}`)
      : null;
    const member = memberRef ? await memberRef.get() : null;
    if (tenantId && member?.exists) {
      return { ok: true, mode: 'firebase', uid, tenantId };
    }
    // Pilot: signed-in users without provisioning yet can read demo tenant.
    return { ok: true, mode: 'firebase', uid, tenantId: tenantIdFrom(req) };
  } catch {
    return { ok: false, error: 'Invalid or expired sign-in token.' };
  }
}

async function authorize(req, { allowApiKey = true } = {}) {
  const firebase = await checkFirebaseAuth(req);
  if (firebase.ok) return firebase;
  if (allowApiKey) {
    const key = checkSyncKey(req);
    if (key.ok) return key;
  }
  return { ok: false, error: firebase.error || checkSyncKey(req).error };
}

function tenantIdFrom(req) {
  return req.get('X-Tenant-Id') || req.get('x-tenant-id')
    || req.query?.tenantId
    || 'demo';
}

export async function handlePortfolioSync(req, res) {
  setCors(req, res, {
    methods: 'GET, POST, OPTIONS',
    headers: 'Content-Type, Authorization, X-Portfolio-Sync-Key, X-Tenant-Id, X-File-Name',
  });

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const auth = await authorize(req, { allowApiKey: req.method === 'POST' });
  if (!auth.ok) {
    res.status(401).json({ error: auth.error });
    return;
  }

  const tenantId = auth.tenantId || tenantIdFrom(req);
  const action = req.query?.action || (req.method === 'GET' ? 'latest' : 'upload');

  try {
    if (req.method === 'GET' && action === 'status') {
      const status = await getSyncStatus(tenantId);
      res.json(status);
      return;
    }

    if (req.method === 'GET' && action === 'latest') {
      const snapshot = await getLatestPortfolio(tenantId);
      if (!snapshot) {
        res.json({ tenantId, snapshot: null, residents: [], properties: [] });
        return;
      }
      res.json({
        tenantId,
        snapshot,
        residents: snapshot.residents || [],
        properties: tenantPropertiesFromSnapshot(snapshot),
      });
      return;
    }

    if (req.method === 'POST') {
      const fileName = req.get('X-File-Name') || req.get('x-file-name') || 'upload.csv';
      let buffer;
      if (req.rawBody) {
        buffer = Buffer.from(req.rawBody);
      } else if (req.body) {
        buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
      } else {
        res.status(400).json({ error: 'Empty request body.' });
        return;
      }

      if (buffer.length < 4) {
        res.status(400).json({ error: 'File too small or empty.' });
        return;
      }

      const rows = parseSpreadsheetBuffer(buffer, fileName);
      const snapshot = ingestRentRollRows(rows, {
        fileName,
        source: 'nightly-sync',
        tenantId,
      });
      await savePortfolioSnapshot(tenantId, snapshot);

      res.json({
        ok: true,
        tenantId,
        summaryText: snapshot.summaryText,
        summary: snapshot.summary,
        importedAt: snapshot.importedAt,
      });
      return;
    }

    res.status(405).json({ error: 'Method not allowed.' });
  } catch (err) {
    console.error('[portfolioSync]', err);
    res.status(500).json({ error: err.message || 'Portfolio sync failed.' });
  }
}
