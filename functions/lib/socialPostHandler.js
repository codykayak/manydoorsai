import { Timestamp } from 'firebase-admin/firestore';
import { generateDailySocialPost } from './socialPostGenerator.js';
import {
  getConfig,
  listPosts,
  saveConfig,
  savePost,
  serializePost,
} from './socialPostStore.js';

const ALLOWED_ORIGINS = [
  'https://www.macrorei.com',
  'https://macrorei.com',
  /^https:\/\/.*\.macrorei\.com$/,
  'https://www.manydoorsai.com',
  'https://manydoorsai.com',
  /^https:\/\/.*\.manydoorsai\.com$/,
  'https://realestate-map-23692.web.app',
  'https://realestate-map-23692.firebaseapp.com',
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

function corsOrigin(req) {
  const origin = req.get('origin') || req.get('Origin') || '';
  if (!origin) return ALLOWED_ORIGINS[0];
  const ok = ALLOWED_ORIGINS.some((o) => (o instanceof RegExp ? o.test(origin) : o === origin));
  return ok ? origin : ALLOWED_ORIGINS[0];
}

export function setSocialCors(req, res) {
  res.set('Access-Control-Allow-Origin', corsOrigin(req));
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, X-Social-Admin-Key');
  res.set('Access-Control-Max-Age', '3600');
}

function checkAdminKey(req) {
  const expected = process.env.SOCIAL_ADMIN_API_KEY;
  if (!expected) {
    return { ok: false, error: 'SOCIAL_ADMIN_API_KEY is not configured on the server.' };
  }
  const provided = req.get('X-Social-Admin-Key') || req.get('x-social-admin-key') || '';
  if (provided !== expected) {
    return { ok: false, error: 'Invalid admin API key.' };
  }
  return { ok: true };
}

export async function handleSocialPosts(req, res) {
  setSocialCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const auth = checkAdminKey(req);
  if (!auth.ok) {
    res.status(401).json({ error: auth.error });
    return;
  }

  try {
    if (req.method === 'GET') {
      const action = req.query?.action || 'list';

      if (action === 'list') {
        const limit = Math.min(Number(req.query?.limit) || 30, 100);
        const posts = await listPosts(limit);
        res.status(200).json({ posts: posts.map(serializePost) });
        return;
      }

      if (action === 'config') {
        const config = await getConfig();
        res.status(200).json({ config });
        return;
      }

      res.status(400).json({ error: `Unknown GET action: ${action}` });
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const { action, postId, updates, force } = req.body ?? {};

    if (action === 'generate') {
      const result = await generateDailySocialPost({
        force: !!force,
        generatedBy: 'manual',
      });
      res.status(200).json({
        post: serializePost(result.post),
        skipped: result.skipped,
        reason: result.reason,
      });
      return;
    }

    if (action === 'approve' && postId) {
      const post = await savePost(postId, {
        status: 'approved',
        approvedAt: Timestamp.now(),
      });
      res.status(200).json({ post: serializePost(post) });
      return;
    }

    if (action === 'reject' && postId) {
      const post = await savePost(postId, { status: 'rejected' });
      res.status(200).json({ post: serializePost(post) });
      return;
    }

    if (action === 'markPosted' && postId) {
      const post = await savePost(postId, {
        status: 'posted',
        postedAt: Timestamp.now(),
      });
      res.status(200).json({ post: serializePost(post) });
      return;
    }

    if (action === 'update' && postId && updates) {
      const allowed = {};
      for (const platform of ['facebook', 'instagram', 'x']) {
        if (updates[platform]?.caption !== undefined) {
          allowed[platform] = { caption: String(updates[platform].caption).slice(0, 8000) };
        }
      }
      const post = await savePost(postId, allowed);
      res.status(200).json({ post: serializePost(post) });
      return;
    }

    if (action === 'updateConfig') {
      const { notifyPhone, notifyEnabled, scheduleHour, adminBaseUrl } = req.body ?? {};
      const patch = {};
      if (notifyPhone !== undefined) patch.notifyPhone = String(notifyPhone);
      if (notifyEnabled !== undefined) patch.notifyEnabled = !!notifyEnabled;
      if (scheduleHour !== undefined) patch.scheduleHour = Number(scheduleHour);
      if (adminBaseUrl !== undefined) patch.adminBaseUrl = String(adminBaseUrl);
      const config = await saveConfig(patch);
      res.status(200).json({ config });
      return;
    }

    res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (e) {
    console.error('[pmSocialPosts]', e);
    res.status(500).json({ error: e.message || 'Request failed' });
  }
}
