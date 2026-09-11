/**
 * Vetted industry brief for the Grok voice agent and public /insights pages.
 * Numbers from ManyDoors models are labeled illustrative. Third-party industry
 * figures are ranges operators commonly hear — not a guarantee.
 */

export const VALUE_ADDS = [
  {
    id: 'deflection',
    title: '24/7 resident deflection',
    hook: 'Most PMCs still pay an answering service to take messages. ManyDoors answers from the property knowledge base.',
    proof:
      'Target 50–70% deflection on FAQ-style volume (pool hours, packages, pets, rent due dates). Sensitive topics always escalate.',
    ownerLine: 'Cuts overtime and answering-service invoices without going dark after 5pm.',
  },
  {
    id: 'speed-to-lead',
    title: 'Speed-to-lead that actually books tours',
    hook: 'ILS and website leads go cold in minutes. Industry missed-call rates on multifamily lines often sit near 50–60%.',
    proof:
      'ManyDoors instant-replies and pre-screens. Illustrative model: ~2+ vacancy-days saved per lease from faster response.',
    ownerLine: 'Vacancy is rent you never collect. Speed is NOI, not a nice-to-have.',
  },
  {
    id: 'maintenance',
    title: 'Maintenance triage that protects the building',
    hook: 'Coordinators mix true emergencies with “how do I reset the GFCI?” Truck rolls are $100–$300+ loaded.',
    proof:
      'Category + priority + emergency fast-track. Self-help for disposal, GFCI, thermostat. Target 15–25% avoidable rolls (~$145 illustrative).',
    ownerLine: 'Fewer after-hours vendor callouts. Faster true emergencies. Cleaner owner stories.',
  },
  {
    id: 'pros',
    title: 'Field HQ with AiBhive Pros',
    hook: 'Triage without a shop playbook still dumps work on the same three vendors.',
    proof:
      'Pros HQ + Diagnose give HVAC, plumbing, electrical, pool, property, and fiber teams a living knowledge base. Voice agent can walk a ticket with those playbooks.',
    ownerLine: 'The operations layer talks to the truck — not another siloed chatbot.',
  },
  {
    id: 'owner-noi',
    title: 'Owner-grade NOI, not a pretty dashboard',
    hook: 'Renewals fail when the PMC cannot itemize what AI (or staff) actually saved.',
    proof:
      'NOI MTD/YTD vs budget vs prior year, AI impact lines, one-click PDF. White-label for investor packets.',
    ownerLine: 'Defends the management agreement in the owner meeting.',
  },
  {
    id: 'pms-layer',
    title: 'Stay on Yardi, RealPage, AppFolio, or Entrata',
    hook: 'Ripping out the ledger is a 6–18 month science project. Operators will not do it for a chatbot.',
    proof:
      'ManyDoors is a system of action on top of the PMS. Read-sync in pilot; write-back on the enterprise roadmap. CSV/XLS import meanwhile.',
    ownerLine: 'No rip-and-replace. One AI layer across acquisitions on different systems.',
  },
  {
    id: 'compliance',
    title: 'Human-in-the-loop where it is legally required',
    hook: 'Generic ChatGPT on a resident line is a Fair Housing and TCPA incident waiting to happen.',
    proof:
      'Fair Housing, legal, eviction, discrimination, and life-safety always escalate. TCPA STOP/HELP path. Tenant-isolated data.',
    ownerLine: 'AI that knows when to shut up is a feature, not a limitation.',
  },
  {
    id: 'oregon-local',
    title: 'Oregon-local, U.S. support',
    hook: 'Midsize Oregon PMCs (roughly 100–5,000 units) sit between spreadsheets and REIT call centers.',
    proof:
      'HQ in Eugene. Markets: Portland, Eugene, Salem, Corvallis, Bend, and the Oregon Coast. 541-321-2630 / info@manydoorsai.com.',
    ownerLine: 'A team that understands Willamette Valley and Central Oregon operating realities.',
  },
];

export const HOW_PMCS_WORK = {
  title: 'How property management companies actually work',
  lede:
    'A third-party PMC is hired by the owner (or the GP of a fund) to run the asset. The PMC does not usually own the building. The scoreboard is NOI — net operating income — because that number drives valuations, loan covenants, and whether the management agreement gets renewed.',
  sections: [
    {
      heading: 'The org chart on a typical community',
      body: 'Community / property manager, assistant, leasing consultants, and a maintenance tech or two. Regional managers cover 4–12 sites. Corporate has accounting, compliance, and owner reporting. Midsize Oregon shops often run dual roles — the same person is leasing and taking work orders after 4pm.',
    },
    {
      heading: 'How the PMC gets paid',
      body: 'Management fee as a percent of collected rent (often 3–8% depending on asset and market), plus leasing commissions, renewal fees, markups on maintenance, and admin fees. If occupancy or collections slip, the PMC’s fee slips. That is why vacancy days, delinquencies, and avoidable truck rolls are not “ops trivia” — they are the business model.',
    },
    {
      heading: 'The daily work that eats the day',
      body: 'Resident texts and calls (hours, packages, parking, rent, noise). Maintenance intake and vendor dispatch. ILS/website leads, tours, applications, screening. Delinquency outreach. Owner packets. Inspections and turns. Industry surveys routinely put tenant communications near 40% of a manager’s time, with maintenance as the largest slice.',
    },
    {
      heading: 'Why phones still fail',
      body: 'Multifamily lines miss a large share of inbound calls — published estimates often land around 50–60%, and many of those callers never try again. A missed leasing call can be a full vacancy month. A delayed leak can turn a $1,200 plumber into an $8,000 unit-below claim. Answering services take messages; they rarely triage, write a work order, or book a tour.',
    },
    {
      heading: 'What “good” looks like to an owner',
      body: 'Occupancy and collections, expense control vs budget, clean turns, low skip/eviction, and a report they can forward to their lender without a follow-up call. AI that cannot show up as a line item on that report does not survive the next budget meeting.',
    },
  ],
};

export const SOFTWARE_STACK = {
  title: 'The software stack PMCs already pay for',
  lede:
    'Property management software is two markets sold as one word. The ledger (PMS) is the system of record. Everything else — phones, chat, ILS, inspections, vendor apps — is a system of action. ManyDoors sits in the second layer on purpose.',
  platforms: [
    {
      name: 'Yardi Voyager',
      fit: 'Enterprise / institutional, complex accounting, multi-entity,  mixed-use. Long implementations, deep GL.',
      manyDoors: 'Do not replace Voyager. Read operational data; handle resident/leasing/maintenance conversations Voyager was not built to answer at 9pm.',
    },
    {
      name: 'RealPage (OneSite and modules)',
      fit: 'Large multifamily operators; historically strong in revenue management and resident ecosystem. Operators should treat pricing-module legal news as a compliance conversation, not a sales talking point we invent.',
      manyDoors: 'Same rule: PMS stays. ManyDoors covers after-hours comms, triage, and owner-facing AI impact.',
    },
    {
      name: 'AppFolio',
      fit: 'SMB to mid-market multifamily. Fastest modern UX; typical 1k–15k unit sweet spot. Strong portals and day-to-day ops.',
      manyDoors: 'AppFolio teams still drown in SMS/ILS volume. ManyDoors is the 24/7 layer and triage brain.',
    },
    {
      name: 'Entrata',
      fit: 'Growth multifamily operators who want leasing CRM, payments, and resident engagement in one suite.',
      manyDoors: 'Entrata is a resident platform. ManyDoors is the AI operations layer that still works if the next acquisition is on Yardi.',
    },
    {
      name: 'MRI, ResMan, Buildium, Rent Manager',
      fit: 'MRI for institutional/commercial-heavy accounting. ResMan/Buildium/Rent Manager for smaller residential shops.',
      manyDoors: 'If they already have a ledger, we layer. If they are on spreadsheets, we still demo — integration comes after the pilot.',
    },
  ],
  gap: 'Most PMS products intake a maintenance request. Few classify emergency vs self-help, walk a GFCI reset, push the tech a Diagnose job, and put the avoided truck roll on the owner PDF. That gap is the ManyDoors value add.',
};

export const CONVERSATION_STEER = `
STEER BACK TO VALUE ADDS (always)
After you help with a general question (news, a competitor, a software comparison, a maintenance how-to), land on one ManyDoors value add:
1) 24/7 deflection vs answering services
2) Speed-to-lead / vacancy days
3) Maintenance triage + Pros field HQ
4) Owner NOI reporting
5) PMS-agnostic layer (no rip-and-replace)
6) Compliance-aware escalation
7) Oregon-local support
Ask a closing question that moves the demo forward: portfolio size, PMS, after-hours coverage, or “want to hear the ROI model?”
`.trim();

export function buildIndustryKnowledgeText() {
  const lines = [
    '## How property management companies work (vetted brief)',
    HOW_PMCS_WORK.lede,
    ...HOW_PMCS_WORK.sections.map((s) => `${s.heading}: ${s.body}`),
    '',
    '## PMS / software stack (vetted brief)',
    SOFTWARE_STACK.lede,
    ...SOFTWARE_STACK.platforms.map((p) => `${p.name} — ${p.fit} ManyDoors: ${p.manyDoors}`),
    SOFTWARE_STACK.gap,
    '',
    '## Value adds (primary conversation theme)',
  ];
  for (const v of VALUE_ADDS) {
    lines.push(`### ${v.title}`);
    lines.push(v.hook);
    lines.push(v.proof);
    lines.push(`Owner line: ${v.ownerLine}`);
  }
  lines.push('');
  lines.push('Industry figures (missed calls ~50–60%, communications ~40% of manager time, answering-service replacement often cited around $8k–$15k per community per year, turn costs often $3k–$5k+) are directional public ranges. ManyDoors ROI numbers on the site are illustrative until a 30–60 day pilot replaces them. Do not invent pricing for ManyDoors or competitors.');
  return lines.join('\n');
}
