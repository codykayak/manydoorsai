/**
 * Server-side CSV / Excel parsing for portfolio sync.
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export function parseCsvBuffer(buffer) {
  const text = buffer.toString('utf8');
  const { data, meta } = Papa.parse(text, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => (h ? h.trim() : h),
  });
  const headers = (meta.fields || []).filter(Boolean);
  if (!headers.length) throw new Error('CSV has no column headers.');
  return data.filter((r) => Object.values(r).some((v) => v !== '' && v != null));
}

export function parseExcelBuffer(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  if (!rows.length) throw new Error('Spreadsheet has no data rows.');
  return rows;
}

export function parseSpreadsheetBuffer(buffer, fileName = '') {
  const fn = (fileName || '').toLowerCase();
  if (/\.(xlsx|xls|xlsm)$/.test(fn)) return parseExcelBuffer(buffer);
  return parseCsvBuffer(buffer);
}
