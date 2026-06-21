import { initializeApp } from 'firebase-admin/app';
import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import { handlePmGatewayChat } from './lib/pmGatewayChatHandler.js';
import { handleSocialPosts } from './lib/socialPostHandler.js';
import { runScheduledSocialPost } from './lib/socialPostScheduler.js';

const geminiApiKey = defineSecret('GEMINI_API_KEY');
const socialAdminApiKey = defineSecret('SOCIAL_ADMIN_API_KEY');
const twilioAccountSid = defineSecret('TWILIO_ACCOUNT_SID');
const twilioAuthToken = defineSecret('TWILIO_AUTH_TOKEN');
const twilioFromNumber = defineSecret('TWILIO_FROM_NUMBER');
const socialNotifyPhone = defineSecret('SOCIAL_NOTIFY_PHONE');

const socialSecrets = [
  geminiApiKey,
  socialAdminApiKey,
  twilioAccountSid,
  twilioAuthToken,
  twilioFromNumber,
  socialNotifyPhone,
];

initializeApp({
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'property-managment-a5ed3.firebasestorage.app',
});

/** Deploy target: property-managment-a5ed3 · public site chat for manydoorsai.com */
const REGION = process.env.FUNCTION_REGION || 'us-central1';

export const pmGatewayChat = onRequest(
  { region: REGION, invoker: 'public', secrets: [geminiApiKey] },
  handlePmGatewayChat,
);

/** Admin API for daily social post generation, review, and approval */
export const pmSocialPosts = onRequest(
  { region: REGION, invoker: 'public', secrets: socialSecrets, timeoutSeconds: 540, memory: '1GiB' },
  handleSocialPosts,
);

/** Daily 7:00 AM Pacific — generate FB/IG/X post bundle + SMS notification */
export const pmSocialPostScheduler = onSchedule(
  {
    schedule: '0 7 * * *',
    timeZone: 'America/Los_Angeles',
    region: REGION,
    secrets: socialSecrets,
    timeoutSeconds: 540,
    memory: '1GiB',
  },
  runScheduledSocialPost,
);
