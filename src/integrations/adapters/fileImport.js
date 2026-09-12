/**
 * CSV / XLS / XLSX importer for residents & rent rolls.
 * Uses the shared rent-roll parser for flexible PMS column mapping.
 */

import { parseRentRollRows } from '../../../shared/rentRollParse.js';
import { genId } from '../../data/store';
import { readSpreadsheetRows } from '../../lib/spreadsheetRead';

/** Accepts .csv, .xls, .xlsx, .xlsm and returns an array of resident objects. */
export async function importResidentsFromFile(file) {
  const rows = await readSpreadsheetRows(file);
  const parsed = parseRentRollRows(rows, { genId, fileName: file.name });
  return parsed.residents.map((r) => ({
    ...r,
    createdAt: r.createdAt || Date.now(),
  }));
}

export default importResidentsFromFile;
