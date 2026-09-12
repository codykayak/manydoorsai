/**
 * Read CSV / Excel files into row arrays for the shared rent-roll parser.
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export function readSpreadsheetRows(file) {
  const name = (file.name || '').toLowerCase();
  if (/\.(xlsx|xls|xlsm)$/.test(name)) return readExcel(file);
  return readCsv(file);
}

function readCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => (h ? h.trim() : h),
      complete: ({ data, meta }) => {
        const headers = (meta.fields || []).filter(Boolean);
        if (!headers.length) return reject(new Error('CSV has no column headers.'));
        resolve(data.filter((r) => Object.values(r).some((v) => v !== '' && v != null)));
      },
      error: reject,
    });
  });
}

function readExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        if (!rows.length) return reject(new Error('Spreadsheet has no data rows.'));
        resolve(rows);
      } catch (err) {
        reject(new Error(`Failed to parse spreadsheet: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsArrayBuffer(file);
  });
}
