/**
 * pmOps — tenant cloud sync + Twilio dispatch for the property-management demo.
 *
 * Auth: X-Ops-Admin-Key (or Authorization: Bearer) must match SOCIAL_ADMIN_API_KEY
 * so one existing secret covers social admin + ops without a new secret deploy.
 */

import { getFirestore } from 'firebase-admin/firestore';
import { sendTwilioSms } from './socialPostNotify.js';

const DB_ID = process.env.PM_FIRESTORE_DB || 'property-managment';

function cors(res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, X-Ops-Admin-Key, Authorization');
}

function getDb() {
  return getFirestore(DB_ID);
}

function authorize(req) {
  const expected = process.env.SOCIAL_ADMIN_API_KEY || '';
  if (!expected) return false;
  const header = req.get('X-Ops-Admin-Key') || '';
  const bearer = (req.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  return header === expected || bearer === expected;
}

function snapshotRef(db, tenantId) {
  return db.collection('tenants').doc(tenantId).collection('demoSnapshots').doc('latest');
}

export async function handlePmOps(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }
  if (!authorize(req)) {
    res.status(401).json({ error: 'Unauthorized', code: 'unauthorized' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const action = body.action;

  try {
    if (action === 'twilioHealth') {
      const configured = Boolean(
        process.env.TWILIO_ACCOUNT_SID
        && process.env.TWILIO_AUTH_TOKEN
        && process.env.TWILIO_FROM_NUMBER,
      );
      res.json({
        ok: true,
        configured,
        fromNumber: configured ? process.env.TWILIO_FROM_NUMBER : null,
        notifyPhone: process.env.SOCIAL_NOTIFY_PHONE || null,
      });
      return;
    }

    if (action === 'sync') {
      const tenantId = String(body.tenantId || 'demo').slice(0, 64);
      const snapshot = body.snapshot;
      if (!snapshot || typeof snapshot !== 'object') {
        res.status(400).json({ error: 'snapshot required' });
        return;
      }
      const db = getDb();
      const payload = {
        ...snapshot,
        syncedAt: Date.now(),
        tenantId,
      };
      await snapshotRef(db, tenantId).set(payload, { merge: true });
      // Also mirror settings onto the tenant root when present (non-destructive).
      if (snapshot.settings) {
        await db.collection('tenants').doc(tenantId).set(
          { settings: snapshot.settings, updatedAt: Date.now(), source: 'pmOps.sync' },
          { merge: true },
        );
      }
      res.json({ ok: true, tenantId, syncedAt: payload.syncedAt });
      return;
    }

    if (action === 'load') {
      const tenantId = String(body.tenantId || 'demo').slice(0, 64);
      const db = getDb();
      const snap = await snapshotRef(db, tenantId).get();
      if (!snap.exists) {
        res.json({ ok: true, found: false, tenantId });
        return;
      }
      res.json({ ok: true, found: true, tenantId, snapshot: snap.data() });
      return;
    }

    if (action === 'dispatch') {
      const to = body.to || process.env.SOCIAL_NOTIFY_PHONE;
      const text = body.body || body.message;
      if (!to || !text) {
        res.status(400).json({ error: 'to and body required' });
        return;
      }
      const result = await sendTwilioSms(to, String(text).slice(0, 320));
      res.json({
        ok: true,
        ...result,
        workOrderId: body.workOrderId || null,
        unit: body.unit || null,
      });
      return;
    }

    res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (e) {
    console.error('[pmOps]', e);
    res.status(500).json({ error: e.message || 'Internal error' });
  }
}
