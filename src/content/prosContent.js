/**
 * ManyDoors AI Pros — marketing + HQ content ported from aibhive.com/pros
 * with ManyDoors branding.
 */

export const PROS_BASE_URL = import.meta.env.VITE_PROS_APP_URL || '';
export const PROS_APK_URL =
  import.meta.env.VITE_PROS_APK_URL || 'https://aibhive.com/api/download/diagnose-apk';
export const PROS_HERO_VIDEO =
  import.meta.env.VITE_PROS_HERO_VIDEO ||
  'https://aibhive.com/grok-pro-diagnose-trades-management-software.mp4';
export const PROS_HERO_POSTER =
  import.meta.env.VITE_PROS_HERO_POSTER || 'https://aibhive.com/pros/hero-field-team.png';

export const PROS_KNOWLEDGE_GROWTH = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  series: [
    { label: 'Field tips', points: [24, 38, 52, 71, 96, 128], color: '#00d2d3' },
    { label: 'Diagnose feedback', points: [18, 29, 41, 58, 74, 102], color: '#58a6ff' },
  ],
};

export const PROS_TRADES = [
  {
    slug: 'hvac',
    name: 'HVAC',
    shortName: 'HVAC',
    icon: 'bolt',
    accent: '#7B9FD4',
    tagline: 'Cooling · Heating · Airflow · Controls',
    description:
      'Field diagnosis for residential HVAC — split systems, heat pumps, furnaces, thermostats, airflow, and refrigeration fundamentals.',
    heroEyebrow: 'HVAC companies',
    seoTitle: 'ManyDoors AI Pros for HVAC — Field diagnosis & living knowledge',
    seoDescription:
      'Dispatch HVAC jobs, grow a shop knowledge base from every truck, and give techs Diagnose with the HVAC pack — split systems, heat pumps, furnaces, and controls.',
    categories: [
      { label: 'Cooling / AC', examples: ['Warm air at vents', 'Frozen coil', 'High head pressure', 'Condensate overflow'] },
      { label: 'Heating', examples: ['Furnace no heat', 'Ignitor failure', 'Heat pump aux heat', 'Gas valve issues'] },
      { label: 'Airflow & ducts', examples: ['Weak room airflow', 'Dirty filter', 'Duct leak', 'Blower issues'] },
      { label: 'Controls', examples: ['Thermostat blank', 'No Y call', 'Zoning damper', 'Communicating faults'] },
    ],
    quickPrompts: [
      'AC blowing warm — outdoor unit running',
      'Evaporator coil frozen solid',
      'Furnace ignites then shuts off in 3 seconds',
      'Heat pump won’t switch to heat mode',
    ],
    commonEquipment: ['Split-system condenser', 'Air handler / furnace', 'Heat pump outdoor unit', 'Thermostat / zone panel'],
    prosFeatures: [
      'Dispatch cool/heat calls with push updates to Diagnose',
      'Capture “that worked” fixes after every job',
      'OEM manual RAG for model-specific playbooks',
      'Periodic GPS roster — know who’s closest to the callback',
    ],
  },
  {
    slug: 'property',
    name: 'Property Maintenance',
    shortName: 'Property',
    icon: 'home',
    accent: '#7C9A6E',
    tagline: 'Appliances · HVAC · Plumbing · Unit turns',
    description:
      'Apartment and property maintenance — appliances, water heaters, unit turns, and cross-trade punch lists when one crew handles everything.',
    heroEyebrow: 'Property maintenance',
    seoTitle: 'ManyDoors AI Pros for Property Maintenance — Turns & field knowledge',
    seoDescription:
      'Run maintenance and turn crews from Pros HQ. Diagnose appliances, water heaters, and unit-turn punch items in the field with a knowledge base that compounds across properties.',
    categories: [
      { label: 'Appliances', examples: ['Washer won’t drain', 'Fridge not cooling', 'Dryer no heat', 'Dishwasher leak'] },
      { label: 'Water heaters', examples: ['No hot water', 'T&P discharge', 'Pilot out', 'Sediment noise'] },
      { label: 'HVAC basics', examples: ['Dirty filter', 'Thermostat blank', 'Frozen coil', 'No call for cool'] },
      { label: 'Unit turns', examples: ['Punch list', 'GFCI dead', 'Smoke detector chirp', 'Door hardware'] },
    ],
    quickPrompts: [
      'Washer fills then won’t drain / spin',
      'Fridge warm, freezer still cold',
      'Electric dryer tumbles but no heat',
      'Garbage disposal hums but won’t grind',
    ],
    commonEquipment: ['Washer / dryer', 'Refrigerator / ice maker', 'Dishwasher', 'Water heater'],
    prosFeatures: [
      'Route turns and work orders to the right tech',
      'Cross-trade tips when electrical or pool issues appear',
      'Shared fixes across your portfolio — not per-building binders',
      'Export job history for owners and asset tracking',
    ],
  },
  {
    slug: 'pool',
    name: 'Pool Service',
    shortName: 'Pool',
    icon: 'spark',
    accent: '#2BB8C8',
    tagline: 'Pumps · Filters · Salt · Automation',
    description:
      'Field diagnosis for pool equipment — pumps, filters, salt systems, heaters, and automation controllers.',
    heroEyebrow: 'Pool service & route techs',
    seoTitle: 'ManyDoors AI Pros for Pool Companies — Pumps, salt & field knowledge',
    seoDescription:
      'Pool route and service companies use Pros HQ to dispatch jobs and grow a living knowledge base. Techs diagnose pumps, salt cells, heaters, and automation in Diagnose.',
    categories: [
      { label: 'Pumps', examples: ['Won’t prime', 'Loud bearing noise', 'VS pump error codes'] },
      { label: 'Filters', examples: ['High pressure', 'DE grid tear', 'Multiport leaks'] },
      { label: 'Salt systems', examples: ['Low salt false alarm', 'Cell scaling', 'No chlorine output'] },
      { label: 'Automation', examples: ['Pentair IntelliCenter', 'Jandy iAqualink', 'Relay failures'] },
    ],
    quickPrompts: [
      'Pump won’t prime after filter clean',
      'Salt cell shows low salt but chemistry is fine',
      'Heater ignites then shuts off',
      'Filter pressure high / weak returns',
    ],
    commonEquipment: ['Variable-speed pump', 'Cartridge / DE / sand filter', 'Salt chlorine generator', 'Automation controller'],
    prosFeatures: [
      'Push route changes and service alerts to techs',
      'Field tips from every truck feed the shop playbook',
      'Manual ingest for Pentair, Jandy, Hayward docs',
      'Job completion prompts capture the actual fix',
    ],
  },
  {
    slug: 'electrical',
    name: 'Electrical',
    shortName: 'Electrical',
    icon: 'bolt',
    accent: '#F0B429',
    tagline: 'Panels · Breakers · Wiring · Code',
    description:
      'Field diagnosis for electrical panels, breakers, wiring faults, and common code lookups for service techs.',
    heroEyebrow: 'Electrical contractors',
    seoTitle: 'ManyDoors AI Pros for Electrical — Panels, breakers & code-aware diagnosis',
    seoDescription:
      'Electrical service companies run dispatch and knowledge from Pros HQ. Techs get lockout-first troubleshooting, panel playbooks, and GFCI/AFCI guidance in Diagnose.',
    categories: [
      { label: 'Panels', examples: ['Hot bus bar', 'Corroded lugs', 'Subpanel bonding'] },
      { label: 'Breakers', examples: ['Nuisance trip', 'AFCI/GFCI faults', 'Double-tapped'] },
      { label: 'Wiring', examples: ['Open neutral', 'Shared neutrals', 'Aluminum pigtails'] },
      { label: 'Code lookup', examples: ['GFCI locations', 'Working clearances', 'Bonding requirements'] },
    ],
    quickPrompts: [
      'Breaker trips when AC starts',
      'Panel feels warm near main lugs',
      'GFCI won’t reset after rain',
      'AFCI trips with vacuum',
    ],
    commonEquipment: ['Main service panel', 'Subpanel', 'AFCI / GFCI breakers', 'Bonding / grounding system'],
    prosFeatures: [
      'Safety-first prompts synced to every truck',
      'Document fixes for repeat service calls',
      'Team roster with optional periodic GPS check-ins',
      'Anonymized tips can help the wider trade network',
    ],
  },
  {
    slug: 'plumbing',
    name: 'Plumbing',
    shortName: 'Plumbing',
    icon: 'wrench',
    accent: '#4A9FD4',
    tagline: 'Drains · Supply · Fixtures · Water heaters',
    description:
      'Field diagnosis for residential and light commercial plumbing — drains, supply pressure, fixtures, water heaters, and venting.',
    heroEyebrow: 'Plumbing contractors',
    seoTitle: 'ManyDoors AI Pros for Plumbing — Drains, fixtures & supply diagnosis',
    seoDescription:
      'Plumbing service companies dispatch from Pros HQ and grow a living knowledge base. Techs get drain, fixture, and water heater playbooks in Diagnose.',
    categories: [
      { label: 'Drains & sewer', examples: ['Main line backup', 'Slow kitchen drain', 'Vent blockage', 'Cleanout access'] },
      { label: 'Water supply', examples: ['Low pressure', 'PRV failure', 'Water hammer', 'Frozen / burst pipe'] },
      { label: 'Fixtures', examples: ['Running toilet', 'Faucet drip', 'Shower valve', 'Angle stop seized'] },
      { label: 'Water heaters', examples: ['No hot water', 'T&P discharge', 'Pilot out', 'Sediment noise'] },
    ],
    quickPrompts: [
      'Main line backs up when washer drains',
      'Low hot water pressure at one fixture only',
      'Toilet runs every 20 minutes',
      'Water heater T&P dripping after heat cycle',
    ],
    commonEquipment: ['Tank / tankless water heater', 'PRV / expansion tank', 'Kitchen / bath fixtures', 'Cleanout & main line'],
    prosFeatures: [
      'Dispatch drain and water heater calls with push updates',
      'Capture fixture model numbers before ordering parts',
      'Pipe sizing and code quick refs in the field app',
      'Job photos sync to HQ for warranty documentation',
    ],
  },
  {
    slug: 'fiber',
    name: 'Fiber & Low Voltage',
    shortName: 'Fiber',
    icon: 'chart',
    accent: '#8B5CF6',
    tagline: 'Splicing · OTDR · PON · Premises',
    description:
      'Field diagnosis for fiber optic installation and repair — fusion splicing, OTDR traces, power budgets, GPON/XGS-PON, ONT/OLT, splitters, connectors, and drop troubleshooting.',
    heroEyebrow: 'Fiber optic contractors & ISP field techs',
    seoTitle: 'ManyDoors AI Pros for Fiber Optics — Splicing, OTDR & PON field knowledge',
    seoDescription:
      'Fiber contractors and ISP field crews use Pros HQ to dispatch jobs and grow a living knowledge base. Techs get splice playbooks, OTDR triage, and ONT/OLT alarm guidance in Diagnose.',
    categories: [
      { label: 'Fusion splicing', examples: ['High splice loss', 'Bubble in splice', 'Wrong fiber program', 'Cleave angle off'] },
      { label: 'Testing & OTDR', examples: ['Ghost events', 'High dB loss', 'No return trace', 'VFL shows break'] },
      { label: 'PON / OLT / ONT', examples: ['ONT LOS alarm', 'ONT not registering', 'Splitter overload', 'OLT port down'] },
      { label: 'Connectors & drops', examples: ['Dirty SC/APC', 'Bad LC polish', 'MPO polarity swap', 'Cut aerial drop'] },
    ],
    quickPrompts: [
      'Fusion splice loss too high on single-mode',
      'OTDR shows ghost event at 2 km',
      'ONT LOS red alarm — no light at customer',
      'Dirty SC/APC connector high loss',
    ],
    commonEquipment: ['Fusion splicer', 'OTDR', 'Optical power meter', 'OLT / ONT (GPON)'],
    prosFeatures: [
      'Dispatch splice and restore jobs with push updates to Diagnose',
      'Capture field fixes after every span or drop repair',
      'Manual ingest for OEM splicer and OLT documentation',
      'Laser-safety prompts synced to every truck',
    ],
  },
];

export const PROS_BY_SLUG = Object.fromEntries(PROS_TRADES.map((t) => [t.slug, t]));

export const PROS_PILLARS = [
  {
    icon: 'book',
    title: 'Living knowledge base',
    body: 'Every diagnose, field note, and “that worked” fix grows a searchable corpus your whole shop inherits.',
  },
  {
    icon: 'users',
    title: 'Crowdsourced by techs',
    body: 'HVAC, plumbing, electrical, pool, property, and fiber packs learn from real trucks — anonymized tips can help the network.',
  },
  {
    icon: 'phone',
    title: 'Dispatch that talks back',
    body: 'Push job updates to Diagnose. Techs confirm completion and describe the fix — it feeds the knowledge loop.',
  },
  {
    icon: 'flag',
    title: 'Where is everybody?',
    body: 'Periodic GPS check-ins (not live stalking). Managers see the roster on a map when tracking is enabled.',
  },
];

export const PROS_FLOW = [
  { step: '1', title: 'Tech diagnoses in the field', detail: 'Voice, photo, or chat — offline pack library + AI when signed in.' },
  { step: '2', title: 'Fix gets captured', detail: 'Notes, photos, and feedback sync to Pros HQ automatically.' },
  { step: '3', title: 'Knowledge compounds', detail: 'Tips, manuals, and job outcomes make the next call faster.' },
];

export const PROS_FIELD_AI = [
  {
    icon: 'spark',
    title: 'Field-scale AI',
    body: 'One of the largest models in the world — always updated to the latest released version.',
  },
  {
    icon: 'chat',
    title: 'Real-time field chat',
    body: 'Solve problems in the field with live chat — voice, photo, or text while you work.',
  },
  {
    icon: 'bolt',
    title: 'Offline mode',
    body: 'Works out of cell signal range. The most extensive local fix-it and install library for tradespeople.',
  },
  {
    icon: 'search',
    title: 'No more YouTube searching',
    body: 'Just ask the app — glove-friendly steps tuned for the truck, not a 20-minute video.',
  },
  {
    icon: 'book',
    title: 'Train it on your equipment',
    body: 'The app learns as your techs contribute — your manuals, fixes, and field notes.',
  },
  {
    icon: 'calendar',
    title: 'Admin portal',
    body: 'Schedule jobs · order parts · GPS tracking · add company spec manuals and tutorials.',
  },
];

export const PROS_INCLUDED_FEATURES = [
  { icon: 'clock', title: 'Clock in & out / GPS time tracking', body: 'Know when techs start and finish — periodic GPS check-ins when tracking is enabled.' },
  { icon: 'check', title: 'Job dispatch & acceptance', body: 'Manager assigns → tech accepts from the field app. No more text-thread chaos.' },
  { icon: 'flag', title: 'Job status pipeline', body: 'On the way · on site · in progress — everyone sees the same live status.' },
  { icon: 'doc', title: 'Digital work orders', body: 'View, update, and sign off on jobs with notes, photos, and field documentation.' },
  { icon: 'upload', title: 'Smart parts ordering', body: 'Order parts from the truck with job context — fewer return trips.' },
  { icon: 'chart', title: 'Weekly reports', body: 'Techs and managers get summaries of jobs completed, activity, and shop momentum.' },
  { icon: 'shield', title: 'Offline mode', body: 'Works with no signal — the full fix-it library and work orders sync when you reconnect.' },
];

export const PROS_PLANS = [
  { id: 'solo', name: 'Individual Tech', price: '$59', period: '/mo', seats: 'Solo technicians', detail: 'All 6 trade packs', featured: false },
  { id: 'crew', name: 'Crew', price: '$149', period: '/mo', seats: '3–5 techs', detail: 'Full Pros HQ + Diagnose for every seat', featured: true },
  { id: 'mid', name: 'Mid-Size', price: '$299', period: '/mo', seats: '6–15 techs', detail: 'Dispatch, GPS, knowledge base & reports', featured: false },
  { id: 'custom', name: 'Custom', price: '$499+', period: '/mo', seats: '15+ techs', detail: 'Includes custom build for your company', featured: false },
];
