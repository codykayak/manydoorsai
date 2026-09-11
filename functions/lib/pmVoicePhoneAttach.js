import { GROK_VOICE_PHONE_E164 } from './voiceContact.js';
import { resolveGrokApiKey, sipWebhookUrl } from './pmVoiceSessionConfig.js';

const LIST_URLS = [
  'https://api.x.ai/v2/phone-numbers',
  'https://api.x.ai/v1/phone-numbers',
];

function digits(value) {
  return String(value || '').replace(/\D/g, '');
}

function flattenNumbers(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  const nested =
    payload.phone_numbers ||
    payload.phoneNumbers ||
    payload.data ||
    payload.items ||
    payload.results;
  if (Array.isArray(nested)) return nested;
  if (payload.phone_number) return [payload.phone_number];
  return [];
}

function numberE164(row) {
  return (
    row?.phone_number ||
    row?.phoneNumber ||
    row?.number ||
    row?.e164 ||
    ''
  );
}

function numberId(row) {
  return row?.phone_number_id || row?.phoneNumberId || row?.id || '';
}

async function xaiJson(apiKey, url, { method = 'GET', body } = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export async function attachSiteVoiceToPhone() {
  const apiKey = resolveGrokApiKey();
  if (!apiKey) throw new Error('Grok API key is not configured.');

  const webhookUrl = sipWebhookUrl();
  const want = digits(GROK_VOICE_PHONE_E164);
  const attempts = [];

  let numbers = [];
  for (const url of LIST_URLS) {
    const listed = await xaiJson(apiKey, url);
    attempts.push({ url, status: listed.status });
    if (listed.ok) {
      numbers = flattenNumbers(listed.data);
      break;
    }
  }

  const match = numbers.find((row) => digits(numberE164(row)) === want || digits(numberE164(row)).endsWith(want.slice(-10)));
  if (!match) {
    return {
      ok: false,
      webhookUrl,
      phone: GROK_VOICE_PHONE_E164,
      attempts,
      numbersFound: numbers.map((row) => numberE164(row)).filter(Boolean),
      error:
        'Could not find that number on the xAI account. In the Grok Voice Agent Builder, set this number to webhook routing and paste the webhook URL.',
    };
  }

  const id = numberId(match);
  const patchUrls = id
    ? LIST_URLS.map((base) => `${base.replace(/\/$/, '')}/${id}`)
    : [];
  const webhook = {
    name: 'ManyDoors site voice',
    url: webhookUrl,
  };

  let patched = null;
  for (const url of patchUrls) {
    for (const body of [{ webhook }, { webhook_url: webhookUrl }, { webhook }]) {
      const result = await xaiJson(apiKey, url, { method: 'PATCH', body });
      attempts.push({ url, method: 'PATCH', status: result.status });
      if (result.ok) {
        patched = result.data;
        break;
      }
    }
    if (patched) break;
  }

  if (!patched) {
    return {
      ok: false,
      webhookUrl,
      phone: GROK_VOICE_PHONE_E164,
      phoneNumberId: id,
      current: match,
      attempts,
      error:
        'xAI did not accept an API update for this number. In Voice Agent Builder, switch the number from its current agent to webhook routing and use the webhook URL below.',
    };
  }

  return {
    ok: true,
    webhookUrl,
    phone: GROK_VOICE_PHONE_E164,
    phoneNumberId: id,
    attached: patched,
  };
}
