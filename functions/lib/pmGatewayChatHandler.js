import { runPmGrokChat } from './pmGrokChat.js';
import { runPmGeminiChat } from './pmGeminiChat.js';
import { setCors } from './cors.js';

async function runPmSiteChat(messages, propertyContext = '') {
  const hasGrok = Boolean(process.env.grok || process.env.XAI_API_KEY || process.env.GROK_API_KEY);
  if (hasGrok) {
    try {
      return await runPmGrokChat(messages, propertyContext);
    } catch (e) {
      console.warn('[pmGatewayChat] Grok failed, trying Gemini:', e.message);
    }
  }
  return runPmGeminiChat(messages, propertyContext);
}

export async function handlePmGatewayChat(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { messages, propertyContext } = req.body ?? {};
    if (!Array.isArray(messages) || !messages.length) {
      res.status(400).json({ error: 'messages array is required' });
      return;
    }

    const sanitized = messages
      .slice(-20)
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

    const reply = await runPmSiteChat(sanitized, typeof propertyContext === 'string' ? propertyContext : '');
    res.status(200).json({ reply });
  } catch (e) {
    console.error('[pmGatewayChat]', e);
    res.status(500).json({ error: e.message || 'Chat failed' });
  }
}
