import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const XAI_BASE = 'https://api.x.ai/v1';

const CHAT_MODELS = [
  process.env.GROK_CHAT_MODEL,
  process.env.XAI_CHAT_MODEL,
  'grok-3-mini',
  'grok-2-1212',
].filter(Boolean);

let knowledgeCache = null;

function loadKnowledge() {
  if (knowledgeCache) return knowledgeCache;
  const path = join(__dirname, '../data/pm-knowledge.txt');
  try {
    knowledgeCache = readFileSync(path, 'utf8');
  } catch {
    knowledgeCache = 'ManyDoors AI is AI property management software. Site: https://www.manydoorsai.com';
  }
  return knowledgeCache;
}

function systemPrompt(knowledge, propertyContext = '') {
  return `You are the ManyDoors AI assistant on manydoorsai.com, powered by Grok (xAI).

PRIMARY ROLE
- Help visitors and operators understand ManyDoors AI: modules, ROI, integrations, onboarding, and support.
- When LIVE PROPERTY CONTEXT is provided, prefer it for property-specific answers (pool hours, leasing, policies, units).

KNOWLEDGE USE
- For product, pricing, features, or policies: ground answers in SITE KNOWLEDGE and property context when available.
- If a ManyDoors-specific fact is not in those sources, say you are not sure and suggest ${process.env.PM_SUPPORT_EMAIL || 'info@manydoorsai.com'} — do not invent features or pricing.

GENERAL CONVERSATION (you have leeway)
- You may answer general questions outside the website: real estate trends, property management best practices, technology, business, coding, math, news-style topics, and casual chat.
- Be helpful, accurate, and concise. No need to refuse reasonable off-topic questions.
- For legal, medical, or tax advice: give general information only and recommend consulting a licensed professional.
- You may have opinions and personality — stay professional and respectful.

${propertyContext ? `LIVE PROPERTY CONTEXT (prefer for property-specific questions):\n${propertyContext}\n\n` : ''}SITE KNOWLEDGE:
${knowledge}`;
}

function resolveApiKey() {
  return process.env.grok || process.env.XAI_API_KEY || process.env.GROK_API_KEY || '';
}

function normalizeMessages(messages) {
  return (messages || [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content?.trim())
    .map((m) => ({ role: m.role, content: m.content.trim() }));
}

async function chatOnce(apiKey, model, messages) {
  const res = await fetch(`${XAI_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.65,
      max_tokens: 2048,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || `xAI API error (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.model = model;
    throw err;
  }

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Empty response from Grok.');
  return text;
}

/**
 * @param {{ role: 'user'|'assistant', content: string }[]} messages
 * @param {string} [propertyContext]
 * @returns {Promise<string>}
 */
export async function runPmGrokChat(messages, propertyContext = '') {
  const apiKey = resolveApiKey();
  if (!apiKey) {
    throw new Error('XAI_API_KEY (or GROK_API_KEY) is not configured on the server.');
  }

  const sanitized = normalizeMessages(messages);
  if (!sanitized.length) {
    throw new Error('A user message is required.');
  }

  const last = sanitized[sanitized.length - 1];
  if (last.role !== 'user') {
    throw new Error('The last message must be from the user.');
  }

  const knowledge = loadKnowledge();
  const payload = [
    { role: 'system', content: systemPrompt(knowledge, propertyContext) },
    ...sanitized,
  ];

  const models = [...new Set(CHAT_MODELS)];
  let lastErr;
  for (const model of models) {
    try {
      return await chatOnce(apiKey, model, payload);
    } catch (e) {
      lastErr = e;
      const retryable = e.status === 400 || e.status === 404 || e.status === 422;
      if (!retryable) throw e;
    }
  }
  throw lastErr || new Error('Grok chat failed');
}
