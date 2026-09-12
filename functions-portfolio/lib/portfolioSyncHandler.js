import { initializeApp, getApps } from 'firebase-admin/app';
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

function checkSyncKey(req) {
  const expected = process.env.PORTFOLIO_SYNC_API_KEY;
  if (!expected) {
    return { ok: false, error: 'PORTFOLIO_SYNC_API_KEY is not configured on the server.' };
  }
  const provided = req.get('X-Portfolio-Sync-Key') || req.get('x-portfolio-sync-key') || '';
  if (!safeCompareKeys(provided, expected)) {
    return { ok: false, error: 'Invalid portfolio sync API key.' };
  }
  return { ok: true };
}

function tenantIdFrom(req) {
  return req.get('X-Tenant-Id') || req.get('x-tenant-id')
    || req.query?.tenantId
    || 'demo';
}

export async function handlePortfolioSync(req, res) {
  setCors(req, res, {
    methods: 'GET, POST, OPTIONS',
    headers: 'Content-Type, X-Portfolio-Sync-Key, X-Tenant-Id, X-File-Name',
  });

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const auth = checkSyncKey(req);
  if (!auth.ok) {
    res.status(401).json({ error: auth.error });
    return;
  }

  const tenantId = tenantIdFrom(req);
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
