/**
 * Document inbox — scaffold for AI-sorted Yardi/PMS file drop zone.
 *
 * Future: server-side OCR + classification pipeline. Today: localStorage demo
 * storage with typed records so UI and backend can wire up without refactors.
 */

const STORAGE_KEY = 'pm:documentInbox';

/** @typedef {'pending' | 'processing' | 'sorted' | 'error'} InboxItemStatus */

/**
 * @typedef {Object} DocumentInboxItem
 * @property {string} id
 * @property {string} fileName
 * @property {number} sizeBytes
 * @property {string} mimeType
 * @property {number} uploadedAt - epoch ms
 * @property {InboxItemStatus} status
 * @property {string} [source] - e.g. 'yardi-daily-export', 'manual-drop'
 * @property {string} [category] - AI-assigned category when sorted
 * @property {string} [propertyId]
 * @property {string} [summary] - AI-generated one-liner
 */

/**
 * @typedef {Object} DocumentInboxConfig
 * @property {boolean} enabled
 * @property {string} yardiExportTime - e.g. '18:00' local
 * @property {string[]} acceptedMimeTypes
 * @property {number} maxFileSizeMb
 */

export const DEFAULT_INBOX_CONFIG = {
  enabled: false,
  yardiExportTime: '18:00',
  acceptedMimeTypes: ['application/pdf', 'text/csv', 'application/vnd.ms-excel'],
  maxFileSizeMb: 25,
};

/** Demo items shown when inbox is empty (Yardi 6pm workflow illustration). */
export const MOCK_INBOX_ITEMS = [
  {
    id: 'inbox_demo_1',
    fileName: 'Yardi_RentRoll_MapleGrove_2026-09-07.pdf',
    sizeBytes: 284000,
    mimeType: 'application/pdf',
    uploadedAt: Date.now() - 1000 * 60 * 60 * 14,
    status: 'sorted',
    source: 'yardi-daily-export',
    category: 'Rent Roll',
    propertyId: 'p1',
    summary: '184 units · 6 vacant · 3 notice-to-vacate',
  },
  {
    id: 'inbox_demo_2',
    fileName: 'Yardi_ARAging_Riverbend_2026-09-07.pdf',
    sizeBytes: 156000,
    mimeType: 'application/pdf',
    uploadedAt: Date.now() - 1000 * 60 * 60 * 13,
    status: 'sorted',
    source: 'yardi-daily-export',
    category: 'A/R Aging',
    propertyId: 'p2',
    summary: '$4,280 delinquent · 2 accounts >30 days',
  },
];

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStore(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('[documentInbox] write failed', err);
  }
  return items;
}

export function genInboxId() {
  return `inbox_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/** List all inbox items (user uploads + optional mock seed). */
export function listInboxItems({ includeMock = true } = {}) {
  const stored = readStore();
  if (stored.length || !includeMock) return stored;
  return MOCK_INBOX_ITEMS;
}

/**
 * Add a file to the demo inbox (in-memory classification stub).
 * @param {File} file
 * @returns {DocumentInboxItem}
 */
export function addInboxFile(file) {
  const item = {
    id: genInboxId(),
    fileName: file.name,
    sizeBytes: file.size,
    mimeType: file.type || 'application/octet-stream',
    uploadedAt: Date.now(),
    status: 'pending',
    source: 'manual-drop',
  };
  const items = [item, ...readStore().filter((x) => !x.id.startsWith('inbox_demo'))];
  writeStore(items);
  return item;
}

/** Mark item as processing (future AI pipeline hook). */
export function updateInboxItem(id, patch) {
  const items = readStore().map((x) => (x.id === id ? { ...x, ...patch } : x));
  writeStore(items);
  return items.find((x) => x.id === id);
}

export function clearInboxDemo() {
  writeStore(readStore().filter((x) => !x.id.startsWith('inbox_demo')));
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
