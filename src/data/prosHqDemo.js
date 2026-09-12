const STORAGE_KEY = 'md:pros:hq';

const DEFAULT_STATE = {
  company: {
    name: 'ManyDoors Field Services',
    tradeType: 'multi',
    inviteCode: 'PROS-MD2026',
  },
  members: [
    { id: 'm1', name: 'Jordan Hale', role: 'owner', email: 'jordan@manydoorsai.com', status: 'active' },
    { id: 'm2', name: 'Sam Ortiz', role: 'manager', email: 'sam@manydoorsai.com', status: 'active' },
    { id: 'm3', name: 'Riley Chen', role: 'tech', email: 'riley@manydoorsai.com', status: 'on_site' },
    { id: 'm4', name: 'Alex Kim', role: 'tech', email: 'alex@manydoorsai.com', status: 'en_route' },
  ],
  jobs: [
    { id: 'j1', title: 'No-cool callback', address: '412 Oak St, Eugene', assignee: 'Riley Chen', pack: 'hvac', status: 'in_progress', priority: 'high', customer: 'Lane Court Apts', phone: '541-555-0142', notes: 'Warm air at vents, outdoor running.' },
    { id: 'j2', title: 'Unit 204 washer drain', address: '88 Mill St #204', assignee: 'Alex Kim', pack: 'property', status: 'queued', priority: 'normal', customer: 'Riverbend PM', phone: '541-555-0190', notes: 'Fills then won’t spin.' },
    { id: 'j3', title: 'Salt cell false low-salt', address: '19 Coastal Loop', assignee: 'Riley Chen', pack: 'pool', status: 'needs_parts', priority: 'normal', customer: 'Coastal HOA', phone: '541-555-0118', notes: 'Chemistry is fine; cell scaled.' },
    { id: 'j4', title: 'GFCI won’t reset', address: '7th & Pearl retail', assignee: 'Alex Kim', pack: 'electrical', status: 'done', priority: 'urgent', customer: 'Pearl Retail LLC', phone: '541-555-0177', notes: 'Patio GFCI after rain.' },
  ],
  parts: [
    { id: 'p1', name: 'Salt cell (T-15)', jobId: 'j3', status: 'pending_approval', qty: 1 },
    { id: 'p2', name: 'GFCI 20A WR', jobId: 'j4', status: 'ordered', qty: 2 },
  ],
  notifications: [
    { id: 'n1', title: 'Overtime heat advisory', body: 'Push no-cool calls to closest tech. Photo required before dispatch close.', priority: 'high' },
    { id: 'n2', title: 'Weekly shop recap', body: '12 jobs closed · 4 new field tips ingested into HVAC pack.', priority: 'normal' },
  ],
  tips: [
    { id: 't1', pack: 'hvac', text: 'Frozen coil with outdoor running — check filter and blower first before adding charge.', helpful: 14 },
    { id: 't2', pack: 'plumbing', text: 'Washer backup into tub is often a shared drum trap, not the main.', helpful: 9 },
  ],
  locations: [
    { id: 'm3', name: 'Riley Chen', lat: 44.0521, lng: -123.0868, label: 'Eugene — on site' },
    { id: 'm4', name: 'Alex Kim', lat: 44.049, lng: -123.092, label: 'En route · 12 min' },
  ],
  settings: {
    locationTrackingEnabled: true,
    locationPingIntervalMinutes: 15,
    requireJobPhotos: true,
    defaultPack: 'property',
    demoPreviewEnabled: true,
  },
};

export function loadProsHq() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    return { ...structuredClone(DEFAULT_STATE), ...JSON.parse(raw) };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

export function saveProsHq(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetProsHq() {
  localStorage.removeItem(STORAGE_KEY);
  return structuredClone(DEFAULT_STATE);
}

export const JOB_STATUSES = ['queued', 'in_progress', 'needs_parts', 'done'];
export const PACKS = ['hvac', 'property', 'pool', 'electrical', 'plumbing', 'fiber'];
