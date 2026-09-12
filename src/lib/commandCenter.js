/**
 * Command center data helpers — derive actionable counts from live PM store
 * data and supplement with realistic demo fixtures where collections are thin.
 */

import { prescreenApplicant } from './prescreen';

/** Vacant unit records for the vacancy tracker (demo + property-linked). */
export const VACANT_UNITS = [
  { unit: '214', property: 'Maple Grove Apartments', propertyId: 'p1', daysVacant: 47, status: 'make-ready', rent: 1525 },
  { unit: '118', property: 'Maple Grove Apartments', propertyId: 'p1', daysVacant: 31, status: 'listed', rent: 1495 },
  { unit: '42', property: 'Riverbend Commons', propertyId: 'p2', daysVacant: 28, status: 'make-ready', rent: 1340 },
  { unit: '307', property: 'Maple Grove Apartments', propertyId: 'p1', daysVacant: 19, status: 'listed', rent: 1680 },
  { unit: '12', property: 'Riverbend Commons', propertyId: 'p2', daysVacant: 12, status: 'notice', rent: 1295 },
  { unit: '201', property: 'Maple Grove Apartments', propertyId: 'p1', daysVacant: 8, status: 'listed', rent: 1450 },
];

/** After-hours AI activity log (demo feed with realistic timestamps). */
export function buildAfterHoursLog(conversations = []) {
  const now = Date.now();
  const hoursAgo = (h) => now - h * 60 * 60 * 1000;

  const demo = [
    { id: 'ah_1', at: hoursAgo(2.3), channel: 'sms', resident: 'Jordan Avery', summary: 'Pool hours answered from KB — auto-resolved', outcome: 'auto-resolved' },
    { id: 'ah_2', at: hoursAgo(5.1), channel: 'sms', resident: 'Unknown caller', summary: 'Lockout after 10 PM — routed to on-call maintenance', outcome: 'escalated' },
    { id: 'ah_3', at: hoursAgo(8.7), channel: 'voice', resident: 'ILS lead', summary: '2BR availability + tour link sent via text', outcome: 'auto-resolved' },
    { id: 'ah_4', at: hoursAgo(11.2), channel: 'sms', resident: 'Marcus Lee', summary: 'Autopay setup instructions — auto-resolved', outcome: 'auto-resolved' },
    { id: 'ah_5', at: hoursAgo(14.5), channel: 'email', resident: 'Priya Natarajan', summary: 'Neighbor noise complaint — Fair Housing guardrail → staff queue', outcome: 'escalated' },
    { id: 'ah_6', at: hoursAgo(18.0), channel: 'sms', resident: 'Sofia Reyes', summary: 'Package room code resent from resident record', outcome: 'auto-resolved' },
    { id: 'ah_7', at: hoursAgo(22.1), channel: 'sms', resident: 'Taylor Brooks', summary: 'Pre-screen knockout: income below 3× rent — polite decline sent', outcome: 'auto-resolved' },
  ];

  // Surface any real after-hours conversations from store (evening timestamps)
  const fromStore = conversations
    .filter((c) => {
      const d = new Date(c.createdAt || c.updatedAt);
      const hour = d.getHours();
      return hour >= 18 || hour < 7;
    })
    .slice(0, 3)
    .map((c) => ({
      id: c.id,
      at: c.updatedAt || c.createdAt,
      channel: c.channel || 'sms',
      resident: c.resident || 'Resident',
      summary: c.messages?.[c.messages.length - 1]?.text?.slice(0, 80) || 'Inquiry handled',
      outcome: c.status === 'auto-resolved' ? 'auto-resolved' : 'escalated',
    }));

  return [...fromStore, ...demo]
    .sort((a, b) => b.at - a.at)
    .slice(0, 12);
}

/**
 * Build high-priority alert chips from live leasing + maintenance data.
 */
export function buildPriorityAlerts({ leasingLeads = [], workOrders = [], leasingConfig = {} } = {}) {
  const screened = leasingLeads.map((l) => ({
    ...l,
    screen: prescreenApplicant(l, leasingConfig),
  }));

  const preApproved = screened.filter(
    (l) => l.stage === 'application' || (l.stage === 'prescreen' && l.screen?.decision === 'qualified'),
  ).length;

  const urgentMaintenance = workOrders.filter(
    (w) => w.status !== 'closed' && (w.priority === 'emergency' || w.priority === 'high'),
  ).length;

  const needsHuman = workOrders.filter((w) => w.status === 'open' && w.priority === 'normal').length;

  const newLeads = leasingLeads.filter((l) => l.stage === 'new').length;

  const alerts = [
    {
      key: 'pre-approved',
      label: 'pre-approved apps',
      count: preApproved || 3,
      icon: 'key',
      severity: 'amber',
      href: 'leasing',
      wired: preApproved > 0,
    },
    {
      key: 'urgent-maintenance',
      label: 'urgent maintenance',
      count: urgentMaintenance || 3,
      icon: 'wrench',
      severity: 'red',
      href: 'maintenance',
      wired: urgentMaintenance > 0,
    },
    {
      key: 'needs-human',
      label: 'awaiting staff review',
      count: needsHuman,
      icon: 'chat',
      severity: 'amber',
      href: 'communications',
      wired: needsHuman > 0,
    },
    {
      key: 'new-leads',
      label: 'uncontacted leads',
      count: newLeads,
      icon: 'users',
      severity: 'blue',
      href: 'leasing',
      wired: newLeads > 0,
    },
  ].filter((a) => a.count > 0);

  return alerts.length ? alerts : [
    { key: 'pre-approved', label: 'pre-approved apps', count: 3, icon: 'key', severity: 'amber', href: 'leasing', wired: false },
    { key: 'urgent-maintenance', label: 'urgent maintenance', count: 3, icon: 'wrench', severity: 'red', href: 'maintenance', wired: false },
  ];
}

export function sortVacantUnits(units = VACANT_UNITS) {
  return [...units].sort((a, b) => b.daysVacant - a.daysVacant);
}

export function vacancyStatusBadge(status) {
  const map = {
    'make-ready': { label: 'Make-ready', cls: 'amber' },
    listed: { label: 'Listed', cls: 'blue' },
    notice: { label: 'Notice', cls: 'gray' },
  };
  return map[status] || { label: status, cls: 'gray' };
}

export function formatRelativeTime(epochMs) {
  const diff = Date.now() - epochMs;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
