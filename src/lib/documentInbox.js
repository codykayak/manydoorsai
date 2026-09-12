/**
 * Document inbox — PMS export drop zone with rent-roll processing.
 *
 * Metadata is stored per-tenant in localStorage. Spreadsheet files are parsed
 * by portfolioImport.js; PDFs are cataloged for future OCR.
 */

import APP_CONFIG from '../config/appConfig';

const STORAGE_KEY = `pm:${APP_CONFIG.defaultTenantId}:documentInbox`;

/** @typedef {'pending' | 'processing' | 'sorted' | 'error'} InboxItemStatus */

/**
 * @typedef {Object} DocumentInboxItem
 * @property {string} id
 * @property {string} fileName
 * @property {number} sizeBytes
 * @property {string} mimeType
 * @property {number} uploadedAt
 * @property {InboxItemStatus} status
 * @property {string} [source]
 * @property {string} [category]
 * @property {string} [propertyId]
 * @property {string} [summary]
 */

export const DEFAULT_INBOX_CONFIG = {
  enabled: true,
  yardiExportTime: '18:00',
  acceptedMimeTypes: ['application/pdf', 'text/csv', 'application/vnd.ms-excel'],
  maxFileSizeMb: 25,
};

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

/** List inbox items (user uploads only — no mock seed). */
export function listInboxItems() {
  return readStore();
}

/**
 * @param {File} file
 * @param {object} [meta]
 */
export function addInboxFile(file, meta = {}) {
  const item = {
    id: genInboxId(),
    fileName: file.name,
    sizeBytes: file.size,
    mimeType: file.type || 'application/octet-stream',
    uploadedAt: Date.now(),
    status: 'pending',
    source: meta.source || 'manual-drop',
  };
  writeStore([item, ...readStore()]);
  return item;
}

export function updateInboxItem(id, patch) {
  const items = readStore().map((x) => (x.id === id ? { ...x, ...patch } : x));
  writeStore(items);
  return items.find((x) => x.id === id);
}

export function classifyInboxItem(fileName) {
  const fn = (fileName || '').toLowerCase();
  if (fn.includes('rent_roll') || fn.includes('rentroll')) return 'Rent Roll';
  if (fn.includes('ar_aging') || fn.includes('aging')) return 'A/R Aging';
  if (fn.includes('work_order') || fn.includes('wo_')) return 'Work Orders';
  if (/\.(csv|xlsx|xls)$/.test(fn)) return 'Rent Roll';
  if (/\.pdf$/.test(fn)) return 'PMS Export';
  return 'Document';
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
