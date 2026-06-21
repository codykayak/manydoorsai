import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Timestamp } from 'firebase-admin/firestore';
import { pickTopicForDate, todayDateKey } from './socialPostTopics.js';
import {
  getConfig,
  getPostByDate,
  savePost,
  uploadSocialImage,
} from './socialPostStore.js';
import { notifyPostReady } from './socialPostNotify.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.0-flash-preview-image-generation';
const TEXT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

let knowledgeCache = null;

function loadKnowledge() {
  if (knowledgeCache) return knowledgeCache;
  const path = join(__dirname, '../data/pm-knowledge.txt');
  try {
    knowledgeCache = readFileSync(path, 'utf8').slice(0, 12000);
  } catch {
    knowledgeCache = 'ManyDoors AI — AI property management software for multifamily operators.';
  }
  return knowledgeCache;
}

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');
  return new GoogleGenerativeAI(apiKey);
}

function extractJson(text) {
  const raw = String(text || '').trim();
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : raw;
  return JSON.parse(candidate);
}

async function researchArticle(topic) {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: TEXT_MODEL,
    tools: [{ googleSearch: {} }],
  });

  const prompt = `You are a content researcher for ManyDoors AI, a multifamily property management software company.

TOPIC: ${topic.title}
ANGLE: ${topic.angle}
SITE: ${topic.siteLink}

Search the web for ONE recent, credible, newsworthy article (published within the last 21 days if possible) related to this topic in multifamily real estate, property management, or PropTech.

Return ONLY valid JSON (no markdown fences):
{
  "title": "exact article headline",
  "url": "https://full-url-to-article",
  "source": "publication name",
  "publishedAt": "YYYY-MM-DD or best estimate",
  "summary": "2-3 sentence summary of the article's key point",
  "whyRelevant": "1 sentence on why this matters to property managers"
}

Rules:
- Must be a real URL from a credible source (trade pub, major news, industry blog)
- Do NOT invent articles or URLs
- Prefer multifamily, apartment, property management, or real estate operations sources`;

  const result = await model.generateContent(prompt);
  const text = result?.response?.text?.();
  if (!text) throw new Error('Empty research response from Gemini.');
  return extractJson(text);
}

async function writeCaptions(topic, article, knowledge) {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: TEXT_MODEL });

  const prompt = `You are the social media manager for ManyDoors AI (manydoorsai.com) — AI property management software for multifamily operators.

BRAND VOICE: Professional, confident, helpful. Not salesy. Speak to property managers and owners. U.S. English.

SITE KNOWLEDGE (for context):
${knowledge.slice(0, 6000)}

TODAY'S TOPIC: ${topic.title} — ${topic.angle}
SITE LINK TO PROMOTE: ${topic.siteLink}

NEWS ARTICLE TO COMMENT ON:
Title: ${article.title}
Source: ${article.source}
URL: ${article.url}
Summary: ${article.summary}
Why relevant: ${article.whyRelevant}

Write original social posts that COMMENT on this news (do not copy the article). Always link back to ${topic.siteLink}. Include a subtle CTA to learn about ManyDoors AI.

Return ONLY valid JSON:
{
  "facebook": {
    "caption": "150-250 words, conversational, end with a question, include the site link"
  },
  "instagram": {
    "caption": "120-180 words, punchy, include 12-18 relevant hashtags at the end on new lines",
    "hashtags": ["#propertymanagement", "..."]
  },
  "x": {
    "caption": "max 270 characters including link, sharp hook, 1-2 hashtags"
  },
  "imagePrompt": "Detailed prompt for a professional social media graphic: modern multifamily/apartment theme, navy and teal accent colors, clean corporate style, no fake logos, no copyrighted brand names, text overlay with a short headline related to the topic"
}`;

  const result = await model.generateContent(prompt);
  const text = result?.response?.text?.();
  if (!text) throw new Error('Empty caption response from Gemini.');
  return extractJson(text);
}

async function generateImage(prompt, aspectHint) {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: IMAGE_MODEL,
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  });

  const fullPrompt = `${prompt}\n\nAspect ratio preference: ${aspectHint}. Professional social media marketing graphic for a B2B SaaS property management company.`;

  const result = await model.generateContent(fullPrompt);
  const parts = result?.response?.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part.inlineData?.data) {
      return Buffer.from(part.inlineData.data, 'base64');
    }
  }

  throw new Error('No image data returned from Gemini image model.');
}

/**
 * Generate the full daily social post bundle.
 * @param {{ force?: boolean, date?: Date }} options
 */
export async function generateDailySocialPost(options = {}) {
  const date = options.date || new Date();
  const dateKey = todayDateKey(date);
  const config = await getConfig();

  if (!options.force) {
    const existing = await getPostByDate(dateKey);
    if (existing && existing.status !== 'failed' && existing.facebook?.caption) {
      return { post: existing, skipped: true, reason: 'already_exists' };
    }
  }

  const topic = pickTopicForDate(date);
  const knowledge = loadKnowledge();
  const errors = [];

  let article;
  try {
    article = await researchArticle(topic);
  } catch (e) {
    console.error('[socialPostGenerator] research failed', e);
    article = {
      title: `${topic.title} trends in multifamily operations`,
      url: topic.siteLink,
      source: 'ManyDoors AI',
      publishedAt: dateKey,
      summary: topic.angle,
      whyRelevant: 'Industry commentary on property operations efficiency.',
    };
    errors.push(`research: ${e.message}`);
  }

  let captions;
  try {
    captions = await writeCaptions(topic, article, knowledge);
  } catch (e) {
    console.error('[socialPostGenerator] captions failed', e);
    throw new Error(`Caption generation failed: ${e.message}`);
  }

  const imagePrompt = captions.imagePrompt
    || `Professional social media graphic for multifamily property management AI software. Theme: ${topic.title}. Modern apartment building, navy and teal colors.`;

  const platforms = [
    { key: 'facebook', aspect: '16:9 landscape' },
    { key: 'instagram', aspect: '1:1 square' },
    { key: 'x', aspect: '16:9 landscape' },
  ];

  const images = {};
  for (const { key, aspect } of platforms) {
    try {
      const buffer = await generateImage(imagePrompt, aspect);
      images[key] = await uploadSocialImage(dateKey, key, buffer);
    } catch (e) {
      console.error(`[socialPostGenerator] image ${key} failed`, e);
      images[key] = null;
      errors.push(`image_${key}: ${e.message}`);
    }
  }

  const post = {
    date: dateKey,
    topic: {
      slug: topic.slug,
      title: topic.title,
      angle: topic.angle,
      siteLink: topic.siteLink,
    },
    sourceArticle: article,
    facebook: {
      caption: captions.facebook?.caption || '',
      imageUrl: images.facebook,
      link: topic.siteLink,
    },
    instagram: {
      caption: captions.instagram?.caption || '',
      hashtags: captions.instagram?.hashtags || [],
      imageUrl: images.instagram,
      link: topic.siteLink,
    },
    x: {
      caption: captions.x?.caption || '',
      imageUrl: images.x,
      link: topic.siteLink,
    },
    imagePrompt,
    status: 'pending_review',
    generatedBy: options.generatedBy || 'scheduler',
    createdAt: Timestamp.now(),
    errors: errors.length ? errors : null,
    adminBaseUrl: config.adminBaseUrl,
  };

  const saved = await savePost(dateKey, post);

  if (config.notifyEnabled && config.notifyPhone) {
    try {
      const notifyResult = await notifyPostReady(
        { ...saved, adminBaseUrl: config.adminBaseUrl },
        config.notifyPhone,
      );
      if (notifyResult.sent) {
        await savePost(dateKey, { notifiedAt: Timestamp.now() });
      }
    } catch (e) {
      console.error('[socialPostGenerator] SMS notify failed', e);
      await savePost(dateKey, { notifyError: e.message });
    }
  }

  return { post: saved, skipped: false };
}
