/**
 * Client for the pmSocialPosts Cloud Function (developer admin).
 */

const DEFAULT_URL =
  'https://us-central1-property-managment-a5ed3.cloudfunctions.net/pmSocialPosts';

const STORAGE_KEY = 'pm:social:adminKey';

export function getSocialApiUrl() {
  return (import.meta.env.VITE_PM_SOCIAL_API_URL || DEFAULT_URL).replace(/\/$/, '');
}

export function getStoredAdminKey() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredAdminKey(key) {
  try {
    if (key) sessionStorage.setItem(STORAGE_KEY, key);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

async function request(method, { action, body, query } = {}) {
  const key = getStoredAdminKey();
  if (!key) throw new Error('Enter your Social Admin API key in settings below.');

  const url = new URL(getSocialApiUrl());
  if (query) {
    for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Social-Admin-Key': key,
    },
    body: method === 'POST' ? JSON.stringify({ action, ...body }) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export function listSocialPosts(limit = 30) {
  return request('GET', { query: { action: 'list', limit: String(limit) } });
}

export function getSocialConfig() {
  return request('GET', { query: { action: 'config' } });
}

export function generateSocialPost(force = false) {
  return request('POST', { action: 'generate', body: { force } });
}

export function approveSocialPost(postId) {
  return request('POST', { action: 'approve', body: { postId } });
}

export function rejectSocialPost(postId) {
  return request('POST', { action: 'reject', body: { postId } });
}

export function markSocialPostPosted(postId) {
  return request('POST', { action: 'markPosted', body: { postId } });
}

export function updateSocialCaptions(postId, updates) {
  return request('POST', { action: 'update', body: { postId, updates } });
}

export function updateSocialConfig(config) {
  return request('POST', { action: 'updateConfig', body: config });
}

export function copyPostBundle(post, platform) {
  const p = post[platform];
  if (!p) return '';
  const lines = [p.caption];
  if (p.link && !p.caption?.includes(p.link)) lines.push('', p.link);
  if (platform === 'instagram' && p.hashtags?.length) {
    lines.push('', p.hashtags.join(' '));
  }
  return lines.join('\n');
}
