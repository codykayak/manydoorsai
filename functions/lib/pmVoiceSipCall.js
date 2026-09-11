import WebSocket from 'ws';
import { getVoiceConfig } from './pmVoiceConfigStore.js';
import { buildSessionConfig, resolveGrokApiKey, VOICE_SESSION_DEFAULTS } from './pmVoiceSessionConfig.js';
import { executeVoiceTool, isClientVoiceTool } from './voiceClientTools.js';

const CLIENT_TOOLS_WAIT_MS = 55 * 60 * 1000;

function extractCallId(body) {
  if (!body) return '';
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return '';
    }
  }
  if (typeof body !== 'object') return '';
  return String(
    body.call_id ||
      body.callId ||
      body.data?.call_id ||
      body.data?.callId ||
      body.data?.id ||
      body.data?.call?.id ||
      body.data?.call?.call_id ||
      '',
  );
}

function sendJson(ws, payload) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
}

async function runSipSession(callId, apiKey) {
  const voiceConfig = await getVoiceConfig();
  const session = buildSessionConfig('', voiceConfig, { telephony: true });
  const greeting = voiceConfig.greeting;
  const url = `wss://api.x.ai/v1/realtime?call_id=${encodeURIComponent(callId)}`;

  await new Promise((resolve, reject) => {
    let settled = false;
    let pendingToolCalls = 0;
    let greeted = false;
    const ws = new WebSocket(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const timer = setTimeout(() => {
      try {
        ws.close();
      } catch {
        /* ignore */
      }
    }, CLIENT_TOOLS_WAIT_MS);

    const finish = (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (err) reject(err);
      else resolve();
    };

    const speakGreeting = () => {
      if (greeted) return;
      greeted = true;
      sendJson(ws, {
        type: 'conversation.item.create',
        item: {
          type: 'force_message',
          role: 'assistant',
          interruptible: false,
          content: [{ type: 'output_text', text: greeting }],
        },
      });
    };

    ws.on('open', () => {
      sendJson(ws, { type: 'session.update', session });
      setTimeout(speakGreeting, 1500);
    });

    ws.on('message', async (raw) => {
      let event;
      try {
        event = JSON.parse(String(raw));
      } catch {
        return;
      }
      const type = event.type;

      if (type === 'session.updated') {
        speakGreeting();
        return;
      }

      if (type === 'response.function_call_arguments.done') {
        const name = event.name || event.item?.name;
        if (!isClientVoiceTool(name)) return;
        pendingToolCalls += 1;
        let args = {};
        try {
          args = event.arguments ? JSON.parse(event.arguments) : {};
        } catch {
          args = {};
        }
        const result = executeVoiceTool(name, args);
        sendJson(ws, {
          type: 'conversation.item.create',
          item: {
            type: 'function_call_output',
            call_id: event.call_id,
            output: JSON.stringify(result),
          },
        });
        pendingToolCalls = Math.max(0, pendingToolCalls - 1);
        if (pendingToolCalls === 0) sendJson(ws, { type: 'response.create' });
      }

      if (type === 'error') {
        const msg = event.error?.message || event.message || 'sip error';
        console.warn('[pmVoiceSipInbound]', callId, msg);
      }
    });

    ws.on('close', () => finish());
    ws.on('error', (err) => {
      console.error('[pmVoiceSipInbound] ws', err?.message || err);
      finish(err);
    });
  });
}

export async function handlePmVoiceSipInbound(req, res) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    res.status(200).json({
      ok: true,
      service: 'pmVoiceSipInbound',
      model: VOICE_SESSION_DEFAULTS.model,
    });
    return;
  }

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = resolveGrokApiKey();
  if (!apiKey) {
    res.status(503).json({ error: 'Grok API key is not configured.' });
    return;
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const callId = extractCallId(body);
  if (!callId) {
    res.status(200).json({ ok: true, ignored: true });
    return;
  }

  res.status(200).json({ ok: true, call_id: callId });

  try {
    await runSipSession(callId, apiKey);
  } catch (e) {
    console.error('[pmVoiceSipInbound] session', callId, e?.message || e);
  }
}
