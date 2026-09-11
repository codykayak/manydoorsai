/**
 * Admin client for Grok voice agent config (same Social Admin API key).
 */

import { getPmVoiceApiUrl } from './pmChatClient';
import { getStoredAdminKey } from './socialPostsApi';

async function adminRequest(method, { action, body } = {}) {
  const key = getStoredAdminKey();
  if (!key) throw new Error('Enter your Social Admin API key on the Social posts tab first (same key).');

  const url = new URL(getPmVoiceApiUrl());
  if (action) url.searchParams.set('action', action);

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

export function loadVoiceAgentConfig() {
  return adminRequest('GET', { action: 'config' });
}

export function saveVoiceAgentConfig(config) {
  return adminRequest('POST', { action: 'saveConfig', body: { config } });
}

export function attachPhoneVoiceLine() {
  return adminRequest('POST', { action: 'attachPhone' });
}

export const VOICE_CHOICES = [
  { id: 'aurora', label: 'Aurora — serene (default)' },
  { id: 'ara', label: 'Ara — warm' },
  { id: 'eve', label: 'Eve — energetic' },
  { id: 'leo', label: 'Leo — authoritative' },
  { id: 'rex', label: 'Rex — professional' },
  { id: 'sal', label: 'Sal — smooth' },
];
