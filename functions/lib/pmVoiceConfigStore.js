import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const DB_ID = process.env.FIRESTORE_DATABASE_ID || 'property-managment';
const CONFIG_DOC = 'voiceAgentConfig/settings';

export const DEFAULT_GREETING =
  "Hello, you've reached Many Doors AI, your full-service multifamily portfolio management team. What can I help you with? Who do I have the pleasure of speaking with?";

export const DEFAULT_MISSION = `You are the live voice of ManyDoors AI — a full-service multifamily portfolio operations team, not a generic chatbot.

NORTH STAR
Lead with value adds: 24/7 resident deflection, speed-to-lead, maintenance triage + AiBhive Pros, owner NOI reporting, and a PMS-agnostic layer on Yardi / RealPage / AppFolio / Entrata. After any helpful detour, steer back to one of those adds and a next step (demo, ROI, or a maintenance walkthrough).

PERSONA
Warm, sharp, slightly formal on the open ("who do I have the pleasure of speaking with?"), then concise. Ask their name, role, portfolio size, and PMS early when it is natural.

WEB SEARCH
You may search the open internet for news, competitors, software comparisons, local market color, or a maintenance fact not in SITE KNOWLEDGE. Prefer SITE KNOWLEDGE first. After an outside answer, always land on a ManyDoors value add. Never invent ManyDoors pricing.

STEER BACK TO VALUE ADDS
After any helpful detour, land on one of: 24/7 deflection, speed-to-lead, maintenance triage + Pros, owner NOI, PMS-agnostic layer, compliance-aware escalation, Oregon-local support. Then ask a next-step question (portfolio size, PMS, after-hours coverage, or the ROI model).`;

export const DEFAULT_VOICE = 'aurora';
export const ALLOWED_VOICES = ['aurora', 'ara', 'eve', 'leo', 'rex', 'sal'];

function db() {
  return getFirestore(DB_ID);
}

export function normalizeVoiceConfig(raw = {}) {
  const greeting = String(raw.greeting || DEFAULT_GREETING).trim().slice(0, 800);
  const mission = String(raw.mission || DEFAULT_MISSION).trim().slice(0, 12000);
  const extraInstructions = String(raw.extraInstructions || '').trim().slice(0, 8000);
  let voice = String(raw.voice || DEFAULT_VOICE).trim().toLowerCase() || DEFAULT_VOICE;
  if (voice === 'eve') voice = DEFAULT_VOICE;
  return {
    greeting: greeting || DEFAULT_GREETING,
    mission: mission || DEFAULT_MISSION,
    extraInstructions,
    voice: ALLOWED_VOICES.includes(voice) ? voice : DEFAULT_VOICE,
    updatedAt: raw.updatedAt || null,
    updatedBy: raw.updatedBy || null,
  };
}

export async function getVoiceConfig() {
  try {
    const snap = await db().doc(CONFIG_DOC).get();
    return normalizeVoiceConfig(snap.exists ? snap.data() : {});
  } catch (e) {
    console.warn('[voiceAgentConfig] read failed, using defaults:', e.message);
    return normalizeVoiceConfig({});
  }
}

export async function saveVoiceConfig(updates = {}) {
  const current = await getVoiceConfig();
  const next = normalizeVoiceConfig({ ...current, ...updates });
  await db().doc(CONFIG_DOC).set(
    {
      greeting: next.greeting,
      mission: next.mission,
      extraInstructions: next.extraInstructions,
      voice: next.voice,
      updatedAt: Timestamp.now(),
    },
    { merge: true },
  );
  return getVoiceConfig();
}
