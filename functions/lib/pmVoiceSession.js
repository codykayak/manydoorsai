import { setCors } from './cors.js';
import { VOICE_SESSION_DEFAULTS, VOICE_TOOLS } from './pmVoiceInstructions.js';
import { buildSessionConfig, resolveGrokApiKey } from './pmVoiceSessionConfig.js';
import { getVoiceConfig, saveVoiceConfig, normalizeVoiceConfig } from './pmVoiceConfigStore.js';
import { attachSiteVoiceToPhone } from './pmVoicePhoneAttach.js';
import { safeCompareKeys } from './socialPostStore.js';

const XAI_CLIENT_SECRETS = 'https://api.x.ai/v1/realtime/client_secrets';
const TOKEN_TTL_SECONDS = 1800;
const CORS = {
  methods: 'GET, POST, OPTIONS',
  headers: 'Content-Type, X-Social-Admin-Key',
};

function resolveApiKey() {
  return resolveGrokApiKey();
}

function checkAdminKey(req) {
  const expected = process.env.SOCIAL_ADMIN_API_KEY;
  if (!expected) {
    return { ok: false, error: 'SOCIAL_ADMIN_API_KEY is not configured on the server.' };
  }
  const provided = req.get('X-Social-Admin-Key') || req.get('x-social-admin-key') || '';
  if (!safeCompareKeys(provided, expected)) {
    return { ok: false, error: 'Invalid admin API key.' };
  }
  return { ok: true };
}

function extractToken(data) {
  if (!data || typeof data !== 'object') return { value: '', expiresAt: 0 };
  const value =
    data.value ||
    data.client_secret?.value ||
    data.client_secret ||
    data.secret ||
    '';
  const expiresAt = Number(data.expires_at || data.client_secret?.expires_at || 0);
  return { value: String(value), expiresAt };
}

async function mintClientSecret(apiKey, sessionConfig, model) {
  const bodies = [
    {
      expires_after: { seconds: TOKEN_TTL_SECONDS },
      model,
      session: sessionConfig,
    },
    { expires_after: { seconds: TOKEN_TTL_SECONDS } },
  ];

  let lastErr;
  for (const body of bodies) {
    const res = await fetch(XAI_CLIENT_SECRETS, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      const token = extractToken(data);
      if (token.value) return token;
      lastErr = new Error('xAI returned an empty voice token.');
      continue;
    }
    lastErr = new Error(data?.error?.message || data?.message || `xAI token error (${res.status})`);
    lastErr.status = res.status;
    const retryable = res.status === 400 || res.status === 422;
    if (!retryable) throw lastErr;
  }
  throw lastErr || new Error('Could not mint a Grok voice token.');
}

async function mintSession(req, res) {
  const apiKey = resolveApiKey();
  if (!apiKey) {
    res.status(503).json({ error: 'Grok API key (secret grok) is not configured on the server.' });
    return;
  }

  const propertyContext =
    typeof req.body?.propertyContext === 'string' ? req.body.propertyContext.slice(0, 8000) : '';
  const voiceConfig = await getVoiceConfig();
  const session = buildSessionConfig(propertyContext, voiceConfig);
  const token = await mintClientSecret(apiKey, session, VOICE_SESSION_DEFAULTS.model);

  res.status(200).json({
    value: token.value,
    expires_at: token.expiresAt,
    model: VOICE_SESSION_DEFAULTS.model,
    voice: voiceConfig.voice,
    greeting: voiceConfig.greeting,
    sampleRate: VOICE_SESSION_DEFAULTS.sampleRate,
    instructions: session.instructions,
    tools: VOICE_TOOLS,
    realtimeUrl: `wss://api.x.ai/v1/realtime?model=${VOICE_SESSION_DEFAULTS.model}`,
  });
}

export async function handlePmVoiceSession(req, res) {
  setCors(req, res, CORS);

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const action = req.query?.action || req.body?.action || '';

  if (req.method === 'GET' && (action === 'config' || action === 'defaults')) {
    const auth = checkAdminKey(req);
    if (!auth.ok) {
      res.status(401).json({ error: auth.error });
      return;
    }
    const config = await getVoiceConfig();
    res.status(200).json({ config: normalizeVoiceConfig(config) });
    return;
  }

  if (req.method === 'POST' && action === 'saveConfig') {
    const auth = checkAdminKey(req);
    if (!auth.ok) {
      res.status(401).json({ error: auth.error });
      return;
    }
    const config = await saveVoiceConfig(req.body?.config || req.body || {});
    res.status(200).json({ config });
    return;
  }

  if (req.method === 'POST' && (action === 'attachPhone' || action === 'syncPhone')) {
    const auth = checkAdminKey(req);
    if (!auth.ok) {
      res.status(401).json({ error: auth.error });
      return;
    }
    try {
      const result = await attachSiteVoiceToPhone();
      res.status(200).json(result);
    } catch (e) {
      res.status(502).json({ error: e.message || 'Could not attach the phone line.' });
    }
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    await mintSession(req, res);
  } catch (e) {
    console.error('[pmVoiceSession]', e);
    res.status(e.status && e.status < 500 ? e.status : 502).json({
      error: e.message || 'Could not start a Grok voice session.',
    });
  }
}
