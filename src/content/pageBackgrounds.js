/**
 * Grok-generated page backdrop images (public/bg/*.jpg).
 * Regenerate: npm run generate:bg
 */
export const PAGE_BACKGROUNDS = {
  overview: '/bg/page-overview.jpg',
  savings: '/bg/page-savings.jpg',
  faq: '/bg/page-faq.jpg',
  pros: '/bg/page-pros.jpg',
  features: '/bg/page-features.jpg',
};

export function backdropForPage(pageKey) {
  return PAGE_BACKGROUNDS[pageKey] || null;
}
