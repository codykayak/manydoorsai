/**
 * End-to-end portfolio import: parse file → update store → residents → settings.
 */

import { buildSnapshotFromImport, mergeResidents, mergeTenantProperties } from './portfolioData';
import { importRentRollFromFile } from './rentRollImport';
import {
  addInboxFile, updateInboxItem, classifyInboxItem,
} from './documentInbox';

const ACCEPTED_EXT = /\.(csv|xls|xlsx|xlsm)$/i;

export function isImportableSpreadsheet(file) {
  return ACCEPTED_EXT.test(file?.name || '');
}

/**
 * Process one or more files through the portfolio pipeline.
 * @param {File[]} files
 * @param {object} ctx - { store, saveSettings, settings, replaceResidents, residents }
 * @param {object} [opts]
 */
export async function processPortfolioFiles(files, ctx, opts = {}) {
  const results = [];
  const spreadsheetFiles = (files || []).filter(isImportableSpreadsheet);
  const otherFiles = (files || []).filter((f) => !isImportableSpreadsheet(f));

  for (const file of otherFiles) {
    const item = addInboxFile(file, { source: opts.source || 'manual-drop' });
    updateInboxItem(item.id, {
      status: 'sorted',
      category: classifyInboxItem(file.name),
      summary: 'Stored for review — spreadsheet import required for auto-sync',
    });
    results.push({ fileName: file.name, ok: true, skipped: true });
  }

  let latestSnapshot = null;
  let latestResidents = ctx.residents || [];

  for (const file of spreadsheetFiles) {
    const item = addInboxFile(file, { source: opts.source || 'manual-drop' });
    updateInboxItem(item.id, { status: 'processing' });

    try {
      const parsed = await importRentRollFromFile(file, { source: opts.source || 'manual-drop' });
      const snapshot = buildSnapshotFromImport(parsed);
      latestSnapshot = snapshot;

      if (parsed.residents?.length) {
        latestResidents = mergeResidents(latestResidents, parsed.residents, { upsert: true });
      }

      updateInboxItem(item.id, {
        status: 'sorted',
        category: parsed.category,
        propertyId: parsed.properties[0]?.id,
        summary: parsed.summaryText,
      });

      results.push({
        fileName: file.name,
        ok: true,
        snapshot,
        summaryText: parsed.summaryText,
        inboxId: item.id,
      });
    } catch (err) {
      updateInboxItem(item.id, { status: 'error', summary: err.message });
      results.push({ fileName: file.name, ok: false, error: err.message, inboxId: item.id });
    }
  }

  if (latestSnapshot) {
    ctx.store.savePortfolio(latestSnapshot);
    ctx.store.addImportHistory({
      fileName: latestSnapshot.fileName,
      source: latestSnapshot.source,
      summaryText: latestSnapshot.summaryText,
      importedAt: latestSnapshot.importedAt,
    });
    ctx.replaceResidents(latestResidents);

    if (latestSnapshot.properties?.length && ctx.settings) {
      const nextSettings = {
        ...ctx.settings,
        tenant: {
          ...ctx.settings.tenant,
          properties: mergeTenantProperties(
            ctx.settings.tenant?.properties,
            latestSnapshot.properties,
          ),
        },
        portfolioSync: {
          ...(ctx.settings.portfolioSync || {}),
          lastImportAt: latestSnapshot.importedAt,
          lastFileName: latestSnapshot.fileName,
          source: latestSnapshot.source,
        },
      };
      ctx.saveSettings(nextSettings);
    }
  }

  return { results, snapshot: latestSnapshot };
}
