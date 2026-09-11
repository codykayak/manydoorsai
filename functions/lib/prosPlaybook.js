/**
 * Demo playbooks for the Grok voice agent + site knowledge.
 * Safe field guidance only — emergencies always escalate.
 */

export const PROS_APP_URL = '/maintenance?panel=pros';
export const PROS_SITE_PATH = '/pros';

export const PROS_TRADE_PLAYBOOKS = [
  {
    slug: 'hvac',
    name: 'HVAC',
    summary: 'Cooling, heating, airflow, and controls. Diagnose on the truck; ManyDoors triages the resident call first.',
    firstQuestions: [
      'Is it no heat, no cooling, or weak airflow?',
      'Does the indoor fan run? Any unusual noise or burning smell?',
      'Have they checked the thermostat mode, setpoint, and batteries?',
      'Filter last changed? Outdoor unit blocked by debris?',
    ],
    selfHelp: [
      'Thermostat set to HEAT or COOL (not OFF/FAN), setpoint past room temp, fresh batteries.',
      'Replace a clogged filter — the most common “AC not cooling” ticket in multifamily.',
      'Clear 2 ft around the outdoor condenser; straighten bent fins only if safe.',
      'If the fan runs but no temperature change, dispatch HVAC — likely refrigerant, capacitor, or control board.',
    ],
    escalate: [
      'Gas smell, carbon monoxide alarm, burning smell, or smoke from the unit.',
      'No heat in freezing weather (life-safety in many jurisdictions).',
      'Water pouring from the air handler (overflow pan / condensate clog can damage units below).',
    ],
  },
  {
    slug: 'plumbing',
    name: 'Plumbing',
    summary: 'Drains, water heaters, fixtures, and leaks. Stop the water first, then decide self-help vs truck roll.',
    firstQuestions: [
      'Is water actively leaking, or is it a slow drip / clog?',
      'Which fixture — toilet, sink, tub, water heater, or in-wall?',
      'Can they shut the fixture stop or unit shutoff?',
      'Any sewage smell or water on the floor of a unit below?',
    ],
    selfHelp: [
      'Running toilet: jiggle the handle; if it keeps filling, lift the tank lid and seat the flapper — often stops a 24/7 water waste ticket.',
      'Garbage disposal humming: power OFF, then press the red RESET on the underside; hex key in the bottom center to free a jam.',
      'Slow drain: plunger first. Do not mix drain chemicals if a plumber may snake the line.',
    ],
    escalate: [
      'Burst pipe, flooding, or water entering electrical areas.',
      'Sewage backup.',
      'No water to the building or a suspected main-line break.',
      'Gas water heater with gas odor.',
    ],
  },
  {
    slug: 'electrical',
    name: 'Electrical',
    summary: 'Outlets, breakers, lighting, and GFCI. Residents never open panels beyond a labeled breaker reset.',
    firstQuestions: [
      'One outlet, one room, or the whole unit?',
      'Any GFCI buttons (TEST/RESET) in kitchen, bath, garage, or patio?',
      'Did a breaker trip? Any burning smell, scorch marks, or buzzing?',
    ],
    selfHelp: [
      'Dead kitchen/bath/garage outlet: find a nearby GFCI and press RESET. Check the breaker panel for a tripped breaker (center position — fully OFF then ON).',
      'Whole-unit outage: confirm neighbors still have power before dispatching; may be utility.',
    ],
    escalate: [
      'Sparks, smoke, burning smell, scorched outlets, or buzzing in the panel.',
      'Water + electricity.',
      'Repeated breaker trips after a reset — do not keep resetting.',
    ],
  },
  {
    slug: 'pool',
    name: 'Pool Service',
    summary: 'Pumps, chemistry, heaters, and equipment. ManyDoors answers amenity hours from the property profile; Pros handles equipment.',
    firstQuestions: [
      'Is this hours/rules, cloudy water, a pump that will not prime, or a heater that will not fire?',
      'Any alarm on the equipment pad? Is the pump running?',
    ],
    selfHelp: [
      'Hours and guest rules come from the property knowledge base — do not invent closing times.',
      'Cloudy water: do not tell residents to dump chemicals. Log it for the pool tech (filter, sanitizer, CYA).',
      'Pump running dry or loud grinding: shut it off and dispatch — do not run a dry pump.',
    ],
    escalate: [
      'Green/cloudy water with scheduled parties (health risk).',
      'Gas heater odor.',
      'Electrical faults at the pad.',
    ],
  },
  {
    slug: 'property',
    name: 'Property Maintenance',
    summary: 'Appliances, unit turns, locks, and punch lists. This is the default queue when the trade is unclear.',
    firstQuestions: [
      'Which unit and which room?',
      'Appliance make/model if visible?',
      'Can the resident stay in the unit safely?',
    ],
    selfHelp: [
      'Fridge not cold: confirm it is plugged in, condenser coils not packed with dust, and door seals close.',
      'Washer will not drain: check the coin trap / drain hose kink before a full appliance call.',
      'Minor cosmetic items (drip, scuff, slow closer) can wait for a bundled make-ready unless they create a trip/slip or lockout.',
    ],
    escalate: [
      'Lockout, failed lock, or break-in.',
      'No heat, flood, fire, gas, or sewage — reclassify to the emergency trade.',
    ],
  },
  {
    slug: 'fiber',
    name: 'Fiber & Low Voltage',
    summary: 'Structured cabling, access control, cameras, and ISP drops. Do not guess ISP outages as in-unit wiring.',
    firstQuestions: [
      'Is it one unit, one closet, or the whole building?',
      'Did the ISP already confirm their side is up?',
      'Any recent construction, unit turn, or access-control change?',
    ],
    selfHelp: [
      'Power-cycle ONT/router 60 seconds. Confirm other devices on Wi-Fi vs Ethernet.',
      'Building-wide outage: check the MDF/IDF first; do not send six techs to six units.',
    ],
    escalate: [
      'Access control failure that locks residents out of the building.',
      'Life-safety cameras/intercoms down at a controlled entry.',
    ],
  },
];

export const PROS_BY_SLUG = Object.fromEntries(PROS_TRADE_PLAYBOOKS.map((t) => [t.slug, t]));

export function lookupProsPlaybook(trade, issue = '') {
  const key = String(trade || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, '');
  const aliases = {
    ac: 'hvac',
    airconditioning: 'hvac',
    heating: 'hvac',
    furnace: 'hvac',
    plumber: 'plumbing',
    leak: 'plumbing',
    drain: 'plumbing',
    electrician: 'electrical',
    power: 'electrical',
    outlet: 'electrical',
    spa: 'pool',
    maintenance: 'property',
    appliance: 'property',
    makeReady: 'property',
    makeready: 'property',
    lowvoltage: 'fiber',
    internet: 'fiber',
    cabling: 'fiber',
  };
  const slug = PROS_BY_SLUG[key] ? key : aliases[key] || key;
  const pack = PROS_BY_SLUG[slug];
  if (!pack) {
    return {
      found: false,
      message: `Unknown trade "${trade}". Use hvac, plumbing, electrical, pool, property, or fiber.`,
      trades: PROS_TRADE_PLAYBOOKS.map((t) => t.slug),
    };
  }
  return {
    found: true,
    trade: pack.slug,
    name: pack.name,
    summary: pack.summary,
    issue: String(issue || '').trim() || null,
    firstQuestions: pack.firstQuestions,
    selfHelp: pack.selfHelp,
    escalate: pack.escalate,
    app: PROS_APP_URL,
    sitePath: `${PROS_SITE_PATH}/${pack.slug}`,
  };
}
