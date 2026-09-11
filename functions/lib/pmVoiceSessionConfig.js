import { buildVoiceInstructions, VOICE_SESSION_DEFAULTS, VOICE_TOOLS } from './pmVoiceInstructions.js';

const REPLACE = {
  ManyDoors: 'Many Doors',
  manydoorsai: 'many doors A I',
  AiBhive: 'A I Bhive',
};

const KEYTERMS = [
  'ManyDoors',
  'AiBhive',
  'Grok',
  'Yardi',
  'AppFolio',
  'RealPage',
  'Entrata',
  'NOI',
  'GFCI',
  'HVAC',
];

export { VOICE_TOOLS, VOICE_SESSION_DEFAULTS };

/** Shared Grok Voice session used by site Call and the inbound phone line. */
export function buildSessionConfig(propertyContext, voiceConfig, { telephony = false } = {}) {
  const voice = voiceConfig.voice || VOICE_SESSION_DEFAULTS.voice;
  const session = {
    voice,
    instructions: buildVoiceInstructions(propertyContext, voiceConfig),
    turn_detection: { type: 'server_vad' },
    tools: VOICE_TOOLS,
    replace: REPLACE,
  };
  if (!telephony) {
    session.audio = {
      input: {
        format: { type: 'audio/pcm', rate: VOICE_SESSION_DEFAULTS.sampleRate },
        transcription: {
          model: 'grok-transcribe',
          language_hint: 'en',
          keyterms: KEYTERMS,
        },
      },
      output: {
        format: { type: 'audio/pcm', rate: VOICE_SESSION_DEFAULTS.sampleRate },
      },
    };
  } else {
    session.audio = {
      input: {
        transcription: {
          model: 'grok-transcribe',
          language_hint: 'en',
          keyterms: KEYTERMS,
        },
      },
    };
  }
  return session;
}

export function resolveGrokApiKey() {
  return process.env.grok || process.env.XAI_API_KEY || process.env.GROK_API_KEY || '';
}

export function sipWebhookUrl() {
  const region = process.env.FUNCTION_REGION || 'us-central1';
  const project = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || 'property-managment-a5ed3';
  return `https://${region}-${project}.cloudfunctions.net/pmVoiceSipInbound`;
}
