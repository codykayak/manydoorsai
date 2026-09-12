import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { GROK_VOICE_PHONE_DISPLAY } from './voiceContact.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MAX_KNOWLEDGE_CHARS = 50000;

let knowledgeCache = null;

function loadKnowledge() {
  if (knowledgeCache) return knowledgeCache;
  const path = join(__dirname, '../data/pm-knowledge.txt');
  try {
    knowledgeCache = readFileSync(path, 'utf8');
  } catch {
    knowledgeCache = 'ManyDoors AI is AI property management software. Site: https://www.manydoorsai.com. Pros: https://www.manydoorsai.com/pros';
  }
  return knowledgeCache;
}

function clip(text, max) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n\n[SITE KNOWLEDGE truncated for voice session — stay conservative on facts not shown.]`;
}

export function buildVoiceInstructions(propertyContext = '', config = {}) {
  const knowledge = clip(loadKnowledge(), MAX_KNOWLEDGE_CHARS);
  const property = typeof propertyContext === 'string' ? propertyContext.trim() : '';
  const mission = String(config.mission || '').trim();
  const extra = String(config.extraInstructions || '').trim();

  return `You are Grok, the live ManyDoors AI voice agent on manydoorsai.com. This is a spoken phone call — sound like a sharp colleague, not a chatbot reading bullets.

${mission ? `MISSION / SYSTEM PROMPT (operator-editable — obey this first):\n${mission}\n` : ''}
PRIMARY JOB
- Open like a receptionist for a full-service multifamily portfolio team. Learn their name, then help.
- Prefer SITE KNOWLEDGE and the value-adds briefing before web search.
- You MAY search the open internet for anything useful (news, competitors, software, local color, general questions). After you answer, steer back to a ManyDoors value add and a next step.
- Help with maintenance-call advice using SITE KNOWLEDGE and tools (triage_maintenance, lookup_pros_playbook).
- AiBhive Pros (/pros and aibhive.com/pros/app) is the field HQ for HVAC, plumbing, electrical, pool, property maintenance, and fiber.

VOICE STYLE
- Short sentences. One question at a time.
- Say "Many Doors AI" for the product. Pronounce NOI as "N-O-I".
- Do not list more than three options unless asked.
- If a ManyDoors-specific fact is missing, say so and offer info@manydoorsai.com or the Eugene office line 541-321-2630.
- Callers can reach you by dialing ${GROK_VOICE_PHONE_DISPLAY} (temporary public demo line) or via Call on manydoorsai.com. If they ask for the voice number, give ${GROK_VOICE_PHONE_DISPLAY}. A local Oregon number will replace it soon. Do not give the 251 number as the Eugene office line.

SAFETY
- Gas, carbon monoxide, fire, smoke, flood, sewage, sparks, lockouts, and no heat in freezing weather: escalate immediately.
- Electrical: residents may reset a labeled breaker or GFCI once. Never open a panel or keep resetting a trip.
- Legal / Fair Housing / eviction / discrimination: escalate to staff.
- This line is a product demo and coaching call. It is not 911.

TOOLS
- triage_maintenance, lookup_pros_playbook, web_search (unrestricted). Use web_search when SITE KNOWLEDGE is not enough.

${extra ? `OPERATOR NOTES:\n${extra}\n\n` : ''}${property ? `LIVE PROPERTY CONTEXT (prefer for this property):\n${property}\n\n` : ''}SITE KNOWLEDGE:
${knowledge}`;
}

export const VOICE_TOOLS = [
  {
    type: 'function',
    name: 'triage_maintenance',
    description:
      'Classify a resident maintenance request: category, priority, emergency flag, self-help tip, and routing. Use this before giving dispatch advice.',
    parameters: {
      type: 'object',
      properties: {
        request: {
          type: 'string',
          description: "The resident's complaint in their own words",
        },
      },
      required: ['request'],
    },
  },
  {
    type: 'function',
    name: 'lookup_pros_playbook',
    description:
      'Get AiBhive Pros / Diagnose field advice for a trade: first questions, safe self-help, and escalate rules.',
    parameters: {
      type: 'object',
      properties: {
        trade: {
          type: 'string',
          description: 'hvac, plumbing, electrical, pool, property, or fiber',
        },
        issue: {
          type: 'string',
          description: 'Optional short description of the equipment or symptom',
        },
      },
      required: ['trade'],
    },
  },
  {
    type: 'web_search',
    location: { country: 'US', city: 'Eugene', region: 'Oregon', timezone: 'America/Los_Angeles' },
  },
];

export const VOICE_SESSION_DEFAULTS = {
  model: 'grok-voice-latest',
  voice: 'aurora',
  sampleRate: 24000,
};
