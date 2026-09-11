/**
 * Per-portfolio property profile — powers onboarding prefill, Savings calculator,
 * and live answers for pool hours, leasing, and unit availability.
 */

export const PROPERTY_PROFILE_STORAGE_KEY = 'manydoors.propertyProfile.v1';

export const DEFAULT_PROPERTY_PROFILE = {
  companyName: '',
  contactName: '',
  phone: '',
  email: '',
  propertyName: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  unitCount: 120,
  estimatedMonthlyCalls: 450,
  estimatedAppsPerMonth: 35,
  estimatedMaintenanceCallsPerMonth: 180,
  pool: {
    enabled: true,
    seasonLabel: 'Memorial Day – Labor Day',
    openTime: '10:00 AM',
    closeTime: '8:00 PM',
    daysOpen: 'Daily',
    rules: 'No glass containers. Children under 14 require adult supervision.',
    lifeguardOnDuty: false,
  },
  leasing: {
    weekdays: '9:00 AM – 6:00 PM',
    saturday: '10:00 AM – 4:00 PM',
    sunday: 'By appointment',
    phone: '',
    email: '',
    tourBookingUrl: '',
  },
  units: [],
  amenities: 'Fitness center, package lockers, dog wash, co-working lounge',
  petPolicy: 'Cats and dogs welcome with deposit and breed restrictions.',
  parkingNotes: 'One covered space per unit; guest parking in lot B.',
  emergencyMaintenancePhone: '',
  onboardingCompleted: false,
  updatedAt: null,
};

export function loadLocalPropertyProfile() {
  try {
    const raw = localStorage.getItem(PROPERTY_PROFILE_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROPERTY_PROFILE };
    return { ...DEFAULT_PROPERTY_PROFILE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PROPERTY_PROFILE };
  }
}

export function saveLocalPropertyProfile(profile) {
  localStorage.setItem(
    PROPERTY_PROFILE_STORAGE_KEY,
    JSON.stringify({ ...profile, updatedAt: Date.now() }),
  );
}

/** Merge onboarding wizard payload into a full property profile. */
export function profileFromOnboarding(payload, existing = DEFAULT_PROPERTY_PROFILE) {
  const units = payload.properties?.[0]?.units || payload.unitCount || existing.unitCount;
  return {
    ...existing,
    companyName: payload.companyName || existing.companyName,
    contactName: payload.contactName || existing.contactName,
    phone: payload.phone || existing.phone,
    email: payload.email || existing.email,
    propertyName: payload.properties?.[0]?.name || payload.propertyName || existing.propertyName,
    address: payload.address || existing.address,
    city: payload.properties?.[0]?.city || payload.city || existing.city,
    state: payload.properties?.[0]?.state || payload.state || existing.state,
    unitCount: Number(units) || existing.unitCount,
    emergencyMaintenancePhone: payload.phone || existing.emergencyMaintenancePhone,
    amenities: payload.amenities || existing.amenities,
    petPolicy: payload.petPolicy || existing.petPolicy,
    leasing: {
      ...existing.leasing,
      ...(payload.leasing || {}),
      phone: payload.leasing?.phone || payload.phone || existing.leasing.phone,
      email: payload.leasing?.email || payload.email || existing.leasing.email,
    },
    pool: payload.pool ? { ...existing.pool, ...payload.pool } : existing.pool,
    estimatedMonthlyCalls: payload.estimatedMonthlyCalls ?? existing.estimatedMonthlyCalls,
    estimatedAppsPerMonth: payload.estimatedAppsPerMonth ?? existing.estimatedAppsPerMonth,
    estimatedMaintenanceCallsPerMonth:
      payload.estimatedMaintenanceCallsPerMonth ?? existing.estimatedMaintenanceCallsPerMonth,
    onboardingCompleted: true,
    updatedAt: Date.now(),
  };
}

export function formatPropertyContextMarkdown(profile) {
  if (!profile) return '';
  const p = profile;
  const lines = [
    '## Live property context (operator-configured)',
    `Company: ${p.companyName || '—'}`,
    `Property: ${p.propertyName || '—'}`,
    `Units: ${p.unitCount || '—'}`,
    `Address: ${[p.address, p.city, p.state, p.zip].filter(Boolean).join(', ') || '—'}`,
    '',
    '### Pool',
    p.pool?.enabled
      ? `Season: ${p.pool.seasonLabel}. Hours: ${p.pool.openTime} – ${p.pool.closeTime}, ${p.pool.daysOpen}. Rules: ${p.pool.rules}`
      : 'Pool not open this season.',
    '',
    '### Leasing office',
    `Weekdays: ${p.leasing?.weekdays || '—'}`,
    `Saturday: ${p.leasing?.saturday || '—'}`,
    `Sunday: ${p.leasing?.sunday || '—'}`,
    `Phone: ${p.leasing?.phone || p.phone || '—'}`,
    `Email: ${p.leasing?.email || p.email || '—'}`,
    '',
    '### Policies & amenities',
    `Amenities: ${p.amenities || '—'}`,
    `Pet policy: ${p.petPolicy || '—'}`,
    `Parking: ${p.parkingNotes || '—'}`,
    `Emergency maintenance: ${p.emergencyMaintenancePhone || '—'}`,
  ];

  if (p.units?.length) {
    lines.push('', '### Unit availability');
    for (const u of p.units.slice(0, 24)) {
      lines.push(
        `- Unit ${u.unitNumber}: ${u.beds}bd/${u.baths}ba, $${u.rent}/mo, ${u.status}, available ${u.availableDate || 'TBD'}`,
      );
    }
  }

  return lines.join('\n');
}
