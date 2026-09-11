/**
 * Programmatic local landing pages for multifamily operators.
 * URL: /property-management/locations/[slug]
 *
 * To add a market: append an object here and add the slug to SERVICE_MARKET_SLUGS
 * in localBusiness.js (and areaServed in schema if it is a primary metro).
 */

export const LOCATIONS = [
  {
    slug: 'portland-or',
    name: 'Portland',
    regionLabel: 'Portland metro & Willamette Valley',
    county: 'Multnomah, Washington & Clackamas Counties',
    pageTitle: 'AI Property Management Software for Portland Multifamily Operators',
    metaDescription:
      'ManyDoors AI helps Portland-area multifamily operators deflect resident inquiries, automate leasing, and triage maintenance — without replacing Yardi, RealPage, or AppFolio.',
    headline: 'AI operations for Portland multifamily — without ripping out your PMS',
    subhead:
      'From inner-eastside walk-ups to suburban garden communities, Portland operators run lean site teams against heavy text volume. ManyDoors AI is the system of action on top of the PMS you already pay for.',
    marketContext: `The Portland metro carries some of Oregon's densest multifamily inventory — and some of the tightest onsite labor. Operators with 2,000–20,000 units compete for leasing and maintenance staff while residents expect sub-hour text replies. Statewide rent-policy attention and insurance volatility mean owners scrutinize NOI line by line; slow speed-to-lead and manual screening still burn vacancy days.`,
    operatorPainPoints: [
      'High inquiry volume across SMS, email, and ILS leads — phones cannot keep up after hours.',
      'Leasing teams juggling tours, applications, and fraud screening on thin headcount.',
      'Maintenance coordinators dispatching truck rolls that self-help could have deflected.',
      'Owner reports that do not itemize AI impact — renewals become a narrative fight.',
    ],
    localProof: [
      'Built for midsize portfolios that are too large for spreadsheets and too small for REIT-scale call centers.',
      'PMS-agnostic layer: works across acquisitions on different systems.',
      'U.S.-based support — not an offshore ticket queue.',
    ],
    neighborhoods: 'Serving operators across Portland, Gresham, Beaverton, Hillsboro, Lake Oswego, and Vancouver WA-adjacent portfolios.',
    pmsReality:
      'Metro Portland portfolios are often mixed-PMS after acquisitions — Voyager at the core asset, AppFolio or Entrata on a 200-unit add. One AI layer across those ledgers is the value add.',
    valueAdds: [
      'After-hours SMS volume in the metro is answering-service expensive. 24/7 deflection is the first NOI conversation.',
      'Speed-to-lead vs national ILS competitors (Apartments.com, Zillow Rentals) — minutes, not next-morning callbacks.',
      'Owner packets for out-of-state capital: itemize AI impact instead of a narrative about “we’re working on it.”',
    ],
  },
  {
    slug: 'eugene-or',
    name: 'Eugene',
    regionLabel: 'Eugene–Springfield & Lane County',
    county: 'Lane County',
    pageTitle: 'AI Property Management Software for Eugene Multifamily Operators',
    metaDescription:
      'ManyDoors AI for Eugene and Lane County multifamily: 24/7 resident communication, automated leasing, and maintenance triage. HQ in Eugene, OR. Live demo available.',
    headline: 'Eugene-built AI for Lane County multifamily operators',
    subhead:
      'ManyDoors AI is headquartered in Eugene. We help regional operators automate the repetitive leasing and maintenance work that hits site teams every day — on top of the PMS you already run.',
    marketContext: `Eugene–Springfield blends university-driven demand with a regional hub for healthcare and public-sector employment. Multifamily operators here often manage a mix of 1970s–2000s stock and newer infill — with seasonal turnover and student-adjacent leasing spikes. Teams of 50–150 staff support thousands of units; after-hours texts and maintenance photos do not wait for Monday morning.`,
    operatorPainPoints: [
      'Turnover and leasing traffic concentrated around academic calendars.',
      'Older stock → more maintenance triage and "how do I reset the disposal?" volume.',
      'Regional operators growing by acquisition need one AI layer across properties.',
      'Owners want NOI defense without hiring another coordinator per community.',
    ],
    localProof: [
      'Headquartered in Eugene, OR — we know Lane County operating realities.',
      'Live build-and-pitch demo — explore dashboard, leasing, and maintenance in minutes.',
      'White-label ready for PMC brands serving the Willamette Valley.',
    ],
    neighborhoods: 'Eugene, Springfield, Cottage Grove, Junction City, Florence, and Lane County portfolios.',
    pmsReality:
      'Lane County shops are frequently AppFolio or Yardi Breeze/Voyager. Student-adjacent turnover spikes the same three tickets: leases, HVAC, and “is the disposal jammed?”',
    valueAdds: [
      'Academic-calendar leasing: AI covers the 10pm ILS lead when the office is closed.',
      'Older stock → GFCI / disposal / thermostat self-help before a truck roll.',
      'HQ is here — a 15-minute demo is a real meeting, not a Zoom from another coast.',
    ],
  },
  {
    slug: 'salem-or',
    name: 'Salem',
    regionLabel: 'Salem & Marion–Polk Counties',
    county: 'Marion & Polk Counties',
    pageTitle: 'AI Property Management Software for Salem Multifamily Operators',
    metaDescription:
      'ManyDoors AI for Salem-area property managers: speed-to-lead, resident deflection, and maintenance triage for midsize multifamily portfolios in the Willamette Valley.',
    headline: 'Automate Salem multifamily ops — keep your existing PMS',
    subhead:
      'State-capital stability meets the same staffing squeeze as every mid-market metro. ManyDoors AI gives Salem operators 24/7 coverage and faster lease-up without a centralized call-center buildout.',
    marketContext: `Salem's economy anchors on government, healthcare, and logistics — steady rental demand with less hype than Portland, but the same operational math: vacancy days hurt, fraud risk is rising, and site teams answer the same resident questions hundreds of times per month. Operators stretching from West Salem to Keizer and into Polk County need scalable communication without proportional headcount.`,
    operatorPainPoints: [
      'Steady lead flow from ILS and website forms — response time still drives conversion.',
      'Application fraud and document tampering — manual review does not scale.',
      'Maintenance volume on aging suburban stock; emergencies must not sit in a queue.',
      'Competing for leasing talent against Portland wages while margins stay local.',
    ],
    localProof: [
      'Illustrative ROI model tuned for 2,000–20,000 unit sweet spot.',
      'Application audit and pre-screen automation in the leasing module.',
      'Owner portal with NOI MTD/YTD and one-click PDF reports.',
    ],
    neighborhoods: 'Salem, Keizer, West Salem, Brooks, and Marion–Polk County communities.',
    pmsReality:
      'Capital-region operators often run AppFolio or RealPage on suburban garden product. Labor is cheaper than Portland; missed vacancy days are not.',
    valueAdds: [
      'Steady government/healthcare demand still loses leases to slow follow-up.',
      'Application audit for document tampering — manual review does not scale at 1,500–5,000 units.',
      'Owner NOI vs budget without hiring a Portland-priced analyst.',
    ],
  },
  {
    slug: 'corvallis-or',
    name: 'Corvallis',
    regionLabel: 'Corvallis & Benton County',
    county: 'Benton County',
    pageTitle: 'AI Property Management Software for Corvallis Multifamily Operators',
    metaDescription:
      'ManyDoors AI for Corvallis multifamily: AI resident replies, leasing automation, and maintenance triage for Benton County operators running lean onsite teams.',
    headline: 'Lean Benton County teams deserve 24/7 AI coverage',
    subhead:
      'Smaller metros still generate big text volume. ManyDoors AI deflects repetitive resident questions and speeds leasing — so Corvallis operators compete like portfolios twice their size.',
    marketContext: `Corvallis multifamily is shaped by university cycles, a tight local hiring pool, and a buyer/renter market smaller than Eugene or Portland. Operators often run dual roles — regional manager plus onsite lead — which makes after-hours coverage and speed-to-lead especially painful. One slow weekend response can mean a lost lease in a market with limited backup inventory.`,
    operatorPainPoints: [
      'Academic-year leasing spikes overwhelm small leasing offices.',
      'Residents text about packages, parking, and amenities — same questions, every week.',
      'Limited maintenance staff; mis-prioritized work orders cost retention.',
      'Hard to justify a third-party answering service on Benton County margins.',
    ],
    localProof: [
      'Target 50–70% deflection on FAQ-style resident volume (illustrative pilot metrics).',
      'Confidence-gated escalation — Fair Housing and emergencies always route to staff.',
      'Demo on sample data — no PMS integration required to explore the product.',
    ],
    neighborhoods: 'Corvallis, Philomath, and Benton County multifamily portfolios.',
    pmsReality:
      'Benton County teams are small. If the leasing consultant is also the after-hours phone, you do not have a process — you have a hero. AI is the second shift.',
    valueAdds: [
      'University-cycle spikes without a call-center contract.',
      'FAQ deflection (parking, packages, amenities) so the onsite person can tour.',
      'Emergency vs self-help so the one maintenance tech is not chasing resets.',
    ],
  },
  {
    slug: 'bend-or',
    name: 'Bend',
    regionLabel: 'Bend & Central Oregon',
    county: 'Deschutes County',
    pageTitle: 'AI Property Management Software for Bend Multifamily Operators',
    metaDescription:
      'ManyDoors AI for Bend and Central Oregon multifamily: maintenance triage, leasing automation, and resident AI — built for fast-growth markets with thin onsite staffing.',
    headline: 'Central Oregon growth — without proportional headcount',
    subhead:
      'Bend operators scaled inventory faster than back-office staff. ManyDoors AI handles resident texts, leasing follow-up, and maintenance triage so teams focus on renewals and owner relationships.',
    marketContext: `Bend and Deschutes County saw rapid multifamily development and migration-driven demand — then the same insurance, turnover, and labor pressures as the rest of Oregon. Seasonal fluctuations and second-home adjacency mean some communities see burst traffic; operators still run on lean teams. Remote owners expect institutional-grade reporting from regional PMCs.`,
    operatorPainPoints: [
      'Growth outpaced hiring — leasing cannot manually pre-screen every application.',
      'Maintenance: emergencies (heat, water) mixed with "how-to" deflection opportunities.',
      'Higher expectations from out-of-state owners on response time and reporting.',
      'Acquisitions on different PMS platforms need one operations layer.',
    ],
    localProof: [
      'Maintenance module: emergency fast-track + self-help before truck rolls.',
      'Owner-grade NOI reporting with AI impact line items.',
      'Serving Central Oregon from our Eugene, OR headquarters.',
    ],
    neighborhoods: 'Bend, Redmond, Sisters, and Deschutes County multifamily communities.',
    pmsReality:
      'Central Oregon growth assets often sit on Entrata or Yardi with remote owners who expect institutional reporting from a regional PMC.',
    valueAdds: [
      'Growth without proportional leasing headcount.',
      'Heat/water emergencies mixed with tourist-season “how-to” volume — triage first.',
      'Owner-grade PDFs for California/Seattle capital that will not fly to Bend for the quarterly.',
    ],
  },
  {
    slug: 'oregon-coast',
    name: 'Oregon Coast',
    regionLabel: 'Oregon Coast — Astoria to Brookings',
    county: 'Clatsop, Tillamook, Lincoln, Lane (west), Coos & Curry Counties',
    pageTitle: 'AI Property Management Software for Oregon Coast Operators',
    metaDescription:
      'ManyDoors AI for Oregon Coast property managers: workforce housing, condos, and mixed STR/long-term portfolios in Newport, Lincoln City, Florence, Cannon Beach, and Coos Bay.',
    headline: 'Coast operations — salt air, seasonal volume, thin benches',
    subhead:
      'Coast PMCs mix long-term workforce housing with condos and, in some towns, short-term rental or condo-hotel inventory. ManyDoors AI covers the phones and maintenance triage so a small office can survive Saturday arrivals and Monday work-order piles.',
    marketContext: `The Oregon Coast is not one market. Cannon Beach and Lincoln City lean visitor-driven; Newport and Coos Bay carry year-round workforce and healthcare demand; Florence sits in both Lane County and coast logistics. Salt, moisture, and older wood stock mean HVAC, plumbing, and building-envelope tickets never really stop. Offices are small. After-hours is often one on-call phone. Vacation-rental platforms already own a lot of STR mindshare — conventional multifamily and HOA/condo operators still need a PMS-agnostic operations layer that does not pretend every door is a Saturday checkout.`,
    operatorPainPoints: [
      'Seasonal burst traffic (weekends, holidays) vs a weekday staff of two or three.',
      'Moisture, salt, and older stock → more HVAC, leaks, and “is this an emergency?” photos.',
      'Mixed inventory: long-term, workforce, condo-hotels, and some STR — one inbox, different SLAs.',
      'Vendors drive from inland; a wasted truck roll is a half-day, not 20 minutes.',
    ],
    localProof: [
      'Maintenance triage that respects drive time — self-help first when safe, dispatch when the building is at risk.',
      '24/7 resident and guest-style FAQ coverage without a 24/7 receptionist.',
      'Pros playbooks for HVAC, plumbing, and property techs who cover multiple coastal towns.',
    ],
    neighborhoods: 'Astoria, Cannon Beach, Tillamook, Lincoln City, Newport, Waldport, Yachats, Florence, Coos Bay, Bandon, and other coast communities.',
    pmsReality:
      'Coast operators may run AppFolio or Rent Manager for long-term doors and a separate STR stack for vacation homes. ManyDoors is for the multifamily / condo operations inbox — we do not claim to replace STR channel managers.',
    valueAdds: [
      'Stop paying a message-taking service for “what time is check-in / is the dryer broken?”',
      'A leak at 11pm in a stacked condo is an insurance event — emergency routing beats voicemail.',
      'Owner reports that work for a Portland investor who owns six doors in Newport and never drives over.',
    ],
  },
];

export const LOCATIONS_INDEX = {
  title: 'Service areas — Oregon multifamily',
  metaDescription:
    'ManyDoors AI serves multifamily operators across Portland, Eugene, Salem, Corvallis, Bend, and the Oregon Coast. AI property management software — headquartered in Eugene, OR.',
  intro:
    'We are headquartered in Eugene, OR and market across Oregon\'s core multifamily metros plus the coast. Each page maps resident communication, leasing, and maintenance to local operator realities — and the value adds we will defend in a pilot. Expanding nationally; contact us for portfolio pricing outside Oregon.',
};

export function getLocationBySlug(slug) {
  return LOCATIONS.find((l) => l.slug === slug);
}

export function getAllLocationSlugs() {
  return LOCATIONS.map((l) => l.slug);
}
