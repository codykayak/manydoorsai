/**
 * Public knowledge pages at /insights and /insights/:slug
 */

import { HOW_PMCS_WORK, SOFTWARE_STACK, VALUE_ADDS } from './pmIndustryKnowledge.js';

export const INSIGHTS_INDEX = {
  title: 'Operator knowledge base',
  metaDescription:
    'How multifamily property management companies work, what software they use, and the ManyDoors AI value adds — written for Oregon operators.',
  intro:
    'A short, vetted briefing for owners, regional managers, and anyone evaluating AI on top of Yardi, RealPage, AppFolio, or Entrata. Start here, then see how it maps to Portland, Eugene, Salem, Corvallis, Bend, and the Oregon Coast.',
};

export const INSIGHT_PAGES = [
  {
    slug: 'how-property-management-companies-work',
    title: HOW_PMCS_WORK.title,
    metaDescription:
      'How third-party multifamily PMCs get paid, what site teams actually do all day, and why missed calls and truck rolls show up in NOI.',
    headline: 'How property management companies actually work',
    subhead: HOW_PMCS_WORK.lede,
    sections: HOW_PMCS_WORK.sections,
    closing:
      'If this sounds like your shop, the next question is not “which chatbot?” It is “which layer sits on the PMS we already pay for and shows up as a value add on the owner packet?” That is ManyDoors AI.',
  },
  {
    slug: 'property-management-software',
    title: SOFTWARE_STACK.title,
    metaDescription:
      'Yardi, RealPage, AppFolio, Entrata, and the rest — what each is for, and why ManyDoors AI is a system of action rather than a ledger replacement.',
    headline: 'The software PMCs already pay for',
    subhead: SOFTWARE_STACK.lede,
    platforms: SOFTWARE_STACK.platforms,
    gap: SOFTWARE_STACK.gap,
    closing:
      'Compare stacks honestly, then keep the ledger. ManyDoors is the 24/7 resident, leasing, and maintenance layer — plus AiBhive Pros for the truck.',
  },
  {
    slug: 'value-adds',
    title: 'ManyDoors AI value adds',
    metaDescription:
      'The value adds ManyDoors AI brings to multifamily operators: deflection, speed-to-lead, maintenance triage, owner NOI, and a PMS-agnostic layer.',
    headline: 'Value adds — what we keep coming back to',
    subhead:
      'Every demo, every voice call, every owner meeting should land on a concrete add — not a feature list. These are the ones we will defend with a 30–60 day pilot.',
    valueAdds: VALUE_ADDS,
    closing:
      'Pick the add that hurts this week — after-hours phones, vacancy, truck rolls, or owner reporting — and we will walk it in the live demo.',
  },
];

export function getInsightBySlug(slug) {
  return INSIGHT_PAGES.find((p) => p.slug === slug);
}
