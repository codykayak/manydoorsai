/**
 * Compliance & audit trail — typed entries for fair housing, SLA, and escalation logs.
 *
 * Demo data today; production wires to immutable audit store / SIEM export.
 */

/** @typedef {'fair-housing' | 'maintenance-sla' | 'escalation' | 'data-access' | 'messaging'} AuditCategory */

/**
 * @typedef {Object} AuditEntry
 * @property {string} id
 * @property {number} at - epoch ms
 * @property {AuditCategory} category
 * @property {string} actor - 'ai' | 'staff' | 'system'
 * @property {string} actorName
 * @property {string} action
 * @property {string} detail
 * @property {string} [propertyId]
 * @property {string} [residentRef] - redacted reference
 * @property {'info' | 'warning' | 'critical'} severity
 */

const now = Date.now();
const hoursAgo = (h) => now - h * 60 * 60 * 1000;
const daysAgo = (d) => now - d * 24 * 60 * 60 * 1000;

export const DEMO_AUDIT_ENTRIES = [
  {
    id: 'aud_1',
    at: hoursAgo(1.5),
    category: 'fair-housing',
    actor: 'ai',
    actorName: 'Resident AI',
    action: 'Sensitive topic blocked',
    detail: 'Neighbor complaint with protected-class language detected — conversation routed to staff queue. No auto-reply sent.',
    propertyId: 'p1',
    residentRef: 'Unit 208',
    severity: 'warning',
  },
  {
    id: 'aud_2',
    at: hoursAgo(3.2),
    category: 'maintenance-sla',
    actor: 'system',
    actorName: 'SLA Monitor',
    action: 'Emergency SLA met',
    detail: 'HVAC no-heat ticket #WO-112 dispatched to on-call in 4m 12s (target: 15m).',
    propertyId: 'p1',
    severity: 'info',
  },
  {
    id: 'aud_3',
    at: hoursAgo(6.8),
    category: 'escalation',
    actor: 'ai',
    actorName: 'Maintenance Triage',
    action: 'Gas odor keyword escalation',
    detail: 'Resident message matched emergency lexicon — 911 advisory sent, property manager SMS alert fired.',
    propertyId: 'p2',
    residentRef: 'Unit 34',
    severity: 'critical',
  },
  {
    id: 'aud_4',
    at: hoursAgo(9.1),
    category: 'fair-housing',
    actor: 'staff',
    actorName: 'Leasing Manager',
    action: 'Manual review completed',
    detail: 'Application screening override documented with reason code: income verification pending (self-employed).',
    propertyId: 'p1',
    severity: 'info',
  },
  {
    id: 'aud_5',
    at: hoursAgo(14.0),
    category: 'maintenance-sla',
    actor: 'system',
    actorName: 'SLA Monitor',
    action: 'SLA breach warning',
    detail: 'Plumbing ticket #WO-156 open 36h without vendor assignment — auto-escalated to regional maintenance lead.',
    propertyId: 'p1',
    severity: 'warning',
  },
  {
    id: 'aud_6',
    at: daysAgo(1.2),
    category: 'messaging',
    actor: 'system',
    actorName: 'TCPA Compliance',
    action: 'Opt-out honored',
    detail: 'Resident replied STOP — SMS channel disabled within 2s. Audit log retained for 7 years.',
    propertyId: 'p2',
    residentRef: 'Unit 12',
    severity: 'info',
  },
  {
    id: 'aud_7',
    at: daysAgo(2.5),
    category: 'data-access',
    actor: 'staff',
    actorName: 'Portfolio Analyst',
    action: 'Owner report exported',
    detail: 'PDF owner report generated for entire portfolio — 280 units, NOI MTD included.',
    severity: 'info',
  },
  {
    id: 'aud_8',
    at: daysAgo(3.0),
    category: 'escalation',
    actor: 'ai',
    actorName: 'Leasing AI',
    action: 'Fraud signal escalated',
    detail: 'Application document mismatch flagged — income docs vs stated employer. Held for manual review.',
    propertyId: 'p1',
    severity: 'warning',
  },
];

export const AUDIT_CATEGORY_META = {
  'fair-housing': { label: 'Fair Housing', icon: 'shield' },
  'maintenance-sla': { label: 'Maintenance SLA', icon: 'clock' },
  escalation: { label: 'Escalation', icon: 'alert' },
  'data-access': { label: 'Data Access', icon: 'doc' },
  messaging: { label: 'Messaging / TCPA', icon: 'chat' },
};

export function listAuditEntries(entries = DEMO_AUDIT_ENTRIES, { category = null, limit = 50 } = {}) {
  let list = [...entries].sort((a, b) => b.at - a.at);
  if (category) list = list.filter((e) => e.category === category);
  return list.slice(0, limit);
}

export function formatAuditTimestamp(epochMs) {
  const d = new Date(epochMs);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export function severityStyle(severity) {
  const map = {
    info: 'blue',
    warning: 'amber',
    critical: 'red',
  };
  return map[severity] || 'gray';
}
