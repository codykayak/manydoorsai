/**
 * Client for ManyDoors Firebase chat + Grok voice session APIs.
 */

import { formatPropertyContextMarkdown } from './propertyProfile';

const REGION = import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'us-central1';
const PROJECT = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'property-managment-a5ed3';
const DEFAULT_CHAT_URL = `https://${REGION}-${PROJECT}.cloudfunctions.net/pmGatewayChat`;

export function getPmChatApiUrl() {
  return (import.meta.env.VITE_PM_CHAT_URL || DEFAULT_CHAT_URL).replace(/\/$/, '');
}

export function getPmVoiceApiUrl() {
  if (import.meta.env.VITE_PM_VOICE_URL) {
    return String(import.meta.env.VITE_PM_VOICE_URL).replace(/\/$/, '');
  }
  return getPmChatApiUrl().replace(/pmGatewayChat\/?$/, 'pmVoiceSession');
}

/**
 * @param {{ role: 'user'|'assistant', content: string }[]} messages
 * @param {object} [propertyProfile] optional live property context from onboarding
 * @returns {Promise<string>}
 */
export async function sendPmChatMessage(messages, propertyProfile) {
  const url = getPmChatApiUrl();
  const propertyContext = propertyProfile ? formatPropertyContextMarkdown(propertyProfile) : '';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, propertyContext }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Chat request failed (${res.status})`);
  }
  if (!data.reply) {
    throw new Error('No reply from chat service');
  }
  return data.reply;
}

/**
 * Mint a short-lived xAI Voice Agent token. The API key never leaves the server.
 * @param {object} [propertyProfile]
 */
export async function createPmVoiceSession(propertyProfile) {
  const url = getPmVoiceApiUrl();
  const propertyContext = propertyProfile ? formatPropertyContextMarkdown(propertyProfile) : '';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ propertyContext }),
  }).catch((e) => {
    throw new Error(
      e?.message === 'Failed to fetch'
        ? 'Could not reach the Grok voice service. Deploy Firebase function pmVoiceSession, then try Call again.'
        : e.message || 'Could not start a voice session.',
    );
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Voice session failed (${res.status})`);
  }
  if (!data.value) {
    throw new Error('Voice session did not return a token.');
  }
  return data;
}
