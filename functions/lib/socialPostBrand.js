/** ManyDoors AI brand constants for social image + caption generation. */

export const BRAND = {
  name: 'ManyDoors AI',
  siteUrl: 'https://www.manydoorsai.com',
  colors: {
    primary: 'navy blue (#0d1b2a)',
    accent: 'teal (#00d2d3)',
    highlight: 'soft coral orange (#f5a623)',
  },
  voice:
    'Professional, confident, helpful. Speak to multifamily property managers and owners. Not salesy. U.S. English.',
  imageStyle:
    'Modern B2B SaaS marketing graphic. Clean corporate design. Multifamily apartment buildings. Navy and teal palette. No fake logos, no copyrighted brand names, no celebrity faces. Subtle gradient background.',
};

export const PLATFORM_SPECS = {
  facebook: {
    label: 'Facebook',
    aspectRatio: '16:9',
    aspectHint: '16:9 landscape, 1200x675 style',
    charLimit: 63206,
    captionGuide: '150-250 words, conversational, end with a question, include site link',
  },
  instagram: {
    label: 'Instagram',
    aspectRatio: '4:5',
    aspectHint: '4:5 portrait feed post, 1080x1350 style',
    charLimit: 2200,
    captionGuide: '120-180 words, punchy hook, 12-18 hashtags on separate lines at end',
  },
  x: {
    label: 'X',
    aspectRatio: '16:9',
    aspectHint: '16:9 landscape, 1200x675 style',
    charLimit: 280,
    captionGuide: 'max 270 characters including link, sharp hook, 1-2 hashtags',
  },
};

export const IMAGE_MODELS = [
  process.env.GEMINI_IMAGE_MODEL || 'gemini-2.0-flash-preview-image-generation',
  'gemini-2.0-flash-exp',
];
