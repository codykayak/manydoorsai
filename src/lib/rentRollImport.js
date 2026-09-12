/**
 * Client-side rent roll / PMS export import.
 */

import { parseRentRollRows, buildImportSummary } from '../../shared/rentRollParse.js';
import { genId } from '../data/store';
import { readSpreadsheetRows } from './spreadsheetRead';

export async function importRentRollFromFile(file, opts = {}) {
  const rows = await readSpreadsheetRows(file);
  const parsed = parseRentRollRows(rows, {
    genId,
    fileName: file.name,
    source: opts.source || 'manual-drop',
  });
  return {
    ...parsed,
    fileName: file.name,
    importedAt: Date.now(),
    source: opts.source || 'manual-drop',
    summaryText: buildImportSummary(parsed),
  };
}

export { buildImportSummary };
