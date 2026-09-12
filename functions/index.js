import { initializeApp } from 'firebase-admin/app';
import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import { handlePmGatewayChat } from './lib/pmGatewayChatHandler.js';
import { handlePmVoiceSession } from './lib/pmVoiceSession.js';
import { handlePmVoiceSipInbound } from './lib/pmVoiceSipCall.js';
import { handleSocialPosts } from './lib/socialPostHandler.js';
import { runScheduledSocialPost } from './lib/socialPostScheduler.js';

/**
 * GCS secret is named `grok` (user-created). Bound as process.env.grok.
 * Social functions still bind Gemini/Twilio secrets by name when they are deployed.
 */
const grokApiKey = defineSecret('grok');

const SOCIAL_SECRETS = [
  'GEMINI_API_KEY',
  'SOCIAL_ADMIN_API_KEY',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_FROM_NUMBER',
  'SOCIAL_NOTIFY_PHONE',
];

initializeApp({
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'property-managment-a5ed3.firebasestorage.app',
});

/** Deploy target: property-managment-a5ed3 · public site chat for manydoorsai.com */
const REGION = process.env.FUNCTION_REGION || 'us-central1';

export const pmGatewayChat = onRequest(
  { region: REGION, invoker: 'public', secrets: [grokApiKey] },
  handlePmGatewayChat,
);

/** Short-lived xAI token for the in-browser Grok Voice Agent (demo Call button). */
export const pmVoiceSession = onRequest(
  { region: REGION, invoker: 'public', secrets: [grokApiKey] },
  handlePmVoiceSession,
);

/** Inbound PSTN / SIP: same session config as site Call (instructions, Aurora, tools). */
export const pmVoiceSipInbound = onRequest(
  {
    region: REGION,
    invoker: 'public',
    secrets: [grokApiKey],
    timeoutSeconds: 3600,
    memory: '512MiB',
    cpu: 1,
  },
  handlePmVoiceSipInbound,
);

/** Admin API for daily social post generation, review, and approval */
export const pmSocialPosts = onRequest(
  { region: REGION, invoker: 'public', secrets: SOCIAL_SECRETS, timeoutSeconds: 540, memory: '1GiB' },
  handleSocialPosts,
);

/** Daily 7:00 AM Pacific — generate FB/IG/X post bundle + SMS notification */
export const pmSocialPostScheduler = onSchedule(
  {
    schedule: '0 7 * * *',
    timeZone: 'America/Los_Angeles',
    region: REGION,
    secrets: SOCIAL_SECRETS,
    timeoutSeconds: 540,
    memory: '1GiB',
  },
  runScheduledSocialPost,
);
