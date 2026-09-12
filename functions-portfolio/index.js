import { onRequest } from 'firebase-functions/v2/https';
import { handlePortfolioSync } from './lib/portfolioSyncHandler.js';

const REGION = process.env.FUNCTION_REGION || 'us-central1';

/** Nightly PMS rent-roll upload API (Yardi CSV workaround). */
export const pmPortfolioSync = onRequest(
  {
    region: REGION,
    invoker: 'public',
    secrets: ['PORTFOLIO_SYNC_API_KEY'],
    timeoutSeconds: 120,
    memory: '512MiB',
  },
  handlePortfolioSync,
);
