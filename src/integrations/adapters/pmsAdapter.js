/**
 * Common PMS / messaging adapter interface + stub + Twilio live health check.
 */

import { getStoredOpsKey, twilioHealth } from '../../lib/opsApi';

export function createStubAdapter(manifest) {
  const notReady = async () => {
    throw new Error(
      `${manifest.name} integration is not active yet. Add sandbox credentials in Settings → Integrations to enable live sync.`,
    );
  };
  return {
    id: manifest.id,
    capabilities: manifest.capabilities || [],
    async testConnection() {
      return {
        ok: false,
        message: `${manifest.name}: credentials captured. Live sync activates once the integration is approved.`,
      };
    },
    getResidents: notReady,
    getLeases: notReady,
    createWorkOrder: notReady,
  };
}

/** Twilio adapter — verifies server-side secrets via pmOps when an ops key is present. */
export function createTwilioAdapter(manifest) {
  return {
    id: manifest.id,
    capabilities: manifest.capabilities || [],
    async testConnection(values = {}) {
      if (!getStoredOpsKey()) {
        // Without ops key, accept field shape and mark pending so demo receipts can still simulate.
        const hasFields = values.accountSid && values.authToken && values.fromNumber;
        return {
          ok: false,
          message: hasFields
            ? 'Credentials captured locally. Add your Ops Admin API key under Persistence to verify live Twilio on the server.'
            : 'Enter Account SID, Auth Token, and From Number — or use Settings → Test Twilio with the Ops Admin key.',
        };
      }
      try {
        const res = await twilioHealth();
        if (res.configured) {
          return {
            ok: true,
            message: `Twilio live on server (from ${res.fromNumber}). Emergency dispatch will send real SMS.`,
          };
        }
        return {
          ok: false,
          message: 'Ops API reachable but TWILIO_* secrets are not configured on Cloud Functions yet.',
        };
      } catch (e) {
        return { ok: false, message: e.message };
      }
    },
    async sendSms() {
      throw new Error('SMS send happens server-side via pmOps dispatch — not from the browser.');
    },
  };
}

/** Resolve an adapter for a given manifest id. */
export function getAdapter(manifest) {
  if (manifest?.id === 'twilio') return createTwilioAdapter(manifest);
  return createStubAdapter(manifest);
}

export default getAdapter;
