import { initializeApp } from 'firebase-admin/app';
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { handlePmGatewayChat } from './lib/pmGatewayChatHandler.js';

const geminiApiKey = defineSecret('GEMINI_API_KEY');

initializeApp();

/** Deploy target: property-managment-a5ed3 · public site chat for manydoorsai.com */
const REGION = process.env.FUNCTION_REGION || 'us-central1';

export const pmGatewayChat = onRequest(
  { region: REGION, invoker: 'public', secrets: [geminiApiKey] },
  handlePmGatewayChat,
);
