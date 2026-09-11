/**
 * Browser-local call tracker + notes for /leeds.
 * Stays on this device (localStorage) so the list is not a public CRM dump.
 */

import { LEEDS_PROSPECTS } from '../data/leedsProspects.js';

export const LEEDS_TRACKER_KEY = 'manydoors.leeds.tracker.v1';

export function emptyLeadState() {
  return {
    status: 'not_contacted',
    notes: '',
    calls: [],
    updatedAt: null,
  };
}

export function loadLeedsTracker() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LEEDS_TRACKER_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveLeedsTracker(map) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LEEDS_TRACKER_KEY, JSON.stringify(map));
}

export function mergeLead(map, id, patch) {
  const prev = map[id] || emptyLeadState();
  return {
    ...map,
    [id]: {
      ...prev,
      ...patch,
      updatedAt: new Date().toISOString(),
    },
  };
}

export function addCall(map, id, call) {
  const prev = map[id] || emptyLeadState();
  const entry = {
    id: call.id || `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: call.at || new Date().toISOString(),
    phone: call.phone || '',
    phoneLabel: call.phoneLabel || '',
    outcome: call.outcome || 'dialed',
    note: call.note || '',
  };
  let status = prev.status;
  if (entry.outcome === 'meeting') status = 'meeting';
  else if (entry.outcome === 'connected' || entry.outcome === 'callback') status = 'in_conversation';
  else if (entry.outcome === 'not_fit') status = 'closed_out';
  else if (status === 'not_contacted') status = 'attempted';

  return mergeLead(map, id, {
    status,
    calls: [entry, ...(prev.calls || [])],
  });
}

function csvEscape(value) {
  const s = value == null ? '' : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function buildLeedsCsv(tracker, prospects = LEEDS_PROSPECTS) {
  const headers = [
    'company',
    'market',
    'hq',
    'units',
    'phone',
    'phone_label',
    'alt_phone',
    'alt_label',
    'email',
    'website',
    'ask_for',
    'how_to_reach',
    'status',
    'notes',
    'call_count',
    'last_called',
    'last_outcome',
  ];
  const rows = prospects.map((p) => {
    const t = tracker[p.id] || emptyLeadState();
    const last = (t.calls || [])[0];
    return [
      p.name,
      p.market,
      p.hq,
      p.unitsLabel,
      p.phone,
      p.phoneLabel,
      p.altPhone || '',
      p.altLabel || '',
      p.email || '',
      p.website || '',
      p.askFor,
      p.howToReach,
      t.status || 'not_contacted',
      t.notes || '',
      String((t.calls || []).length),
      last?.at || '',
      last?.outcome || '',
    ].map(csvEscape).join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}

export function downloadLeedsCsv(tracker, prospects = LEEDS_PROSPECTS, filenamePrefix = 'manydoors-leeds') {
  const csv = buildLeedsCsv(tracker, prospects);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const day = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `${filenamePrefix}-${day}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
