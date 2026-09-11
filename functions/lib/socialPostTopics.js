/**
 * Rotating social post topics tied to ManyDoors AI site content.
 * Each topic maps to a feature page or marketing angle on manydoorsai.com.
 */

export const SOCIAL_TOPICS = [
  {
    slug: 'maintenance',
    title: 'AI Maintenance Triage',
    angle: 'reducing emergency maintenance calls and truck rolls with AI triage',
    siteLink: 'https://www.manydoorsai.com/features/maintenance',
    searchQueries: [
      'multifamily maintenance costs 2026',
      'property management emergency maintenance trends',
      'AI facilities management apartments',
    ],
  },
  {
    slug: 'leasing',
    title: 'Automated Leasing',
    angle: 'speed-to-lead and vacancy reduction for multifamily operators',
    siteLink: 'https://www.manydoorsai.com/features/leasing',
    searchQueries: [
      'multifamily leasing vacancy rates 2026',
      'apartment lead response time conversion',
      'property management leasing automation',
    ],
  },
  {
    slug: 'communications',
    title: 'AI Resident Communication',
    angle: 'deflecting repetitive resident inquiries with 24/7 AI support',
    siteLink: 'https://www.manydoorsai.com/features/communications',
    searchQueries: [
      'multifamily resident communication technology',
      'property management chatbot resident portal',
      'apartment resident service automation',
    ],
  },
  {
    slug: 'owner-portal',
    title: 'Owner Portal & NOI Reporting',
    angle: 'investor reporting and NOI transparency for multifamily owners',
    siteLink: 'https://www.manydoorsai.com/features/owner-portal',
    searchQueries: [
      'multifamily NOI reporting technology',
      'real estate investor reporting software',
      'property management owner portal trends',
    ],
  },
  {
    slug: 'industry',
    title: 'Multifamily Industry News',
    angle: 'commentary on multifamily operations, PropTech, and AI adoption',
    siteLink: 'https://www.manydoorsai.com',
    searchQueries: [
      'multifamily real estate news this week',
      'proptech multifamily AI adoption',
      'apartment industry operations trends',
    ],
  },
  {
    slug: 'oregon',
    title: 'Oregon Multifamily Market',
    angle: 'property management innovation in Oregon and the Pacific Northwest',
    siteLink: 'https://www.manydoorsai.com/locations',
    searchQueries: [
      'Oregon multifamily housing market',
      'Eugene Portland apartment market trends',
      'Pacific Northwest rental housing news',
    ],
  },
  {
    slug: 'roi',
    title: 'Portfolio ROI',
    angle: 'quantifying savings from AI in property operations',
    siteLink: 'https://www.manydoorsai.com/roi-calculator',
    searchQueries: [
      'property management operational efficiency savings',
      'multifamily operating expense reduction',
      'AI property management ROI',
    ],
  },
];

/** Pick topic for a given date — rotates deterministically so the same day always gets the same topic. */
export function pickTopicForDate(date = new Date()) {
  const dayOfYear = Math.floor(
    (date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24),
  );
  return SOCIAL_TOPICS[dayOfYear % SOCIAL_TOPICS.length];
}

export function todayDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}
