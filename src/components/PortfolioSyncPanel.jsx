import { useState } from 'react';
import { usePm } from '../context/PmContext';
import Icon from './Icon';
import APP_CONFIG from '../config/appConfig';
import {
  getPortfolioSyncUrl, getStoredSyncKey, setStoredSyncKey, fetchSyncStatus,
} from '../lib/portfolioSyncApi';
import styles from '../pm.module.css';

export default function PortfolioSyncPanel() {
  const { portfolio, portfolioSynced, syncPortfolioFromServer, importPortfolioFiles, settings } = usePm();
  const [apiKey, setApiKey] = useState(() => getStoredSyncKey());
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [status, setStatus] = useState(null);

  const syncUrl = getPortfolioSyncUrl();
  const tenantId = APP_CONFIG.defaultTenantId;
  const lastImport = settings?.portfolioSync?.lastImportAt || portfolio?.importedAt;

  async function saveKey() {
    setStoredSyncKey(apiKey.trim());
    setMsg('API key saved locally.');
    setErr(null);
  }

  async function pullLatest() {
    setSyncing(true);
    setMsg(null);
    setErr(null);
    try {
      const snap = await syncPortfolioFromServer();
      setMsg(snap ? `Synced — ${snap.summaryText}` : 'No snapshot on server yet.');
    } catch (e) {
      setErr(e.message);
    } finally {
      setSyncing(false);
    }
  }

  async function checkStatus() {
    try {
      const data = await fetchSyncStatus();
      setStatus(data);
    } catch (e) {
      setErr(e.message);
    }
  }

  async function onManualFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSyncing(true);
    setErr(null);
    try {
      const { snapshot } = await importPortfolioFiles([file], { source: 'manual-drop' });
      setMsg(snapshot ? `Imported — ${snapshot.summaryText}` : 'Import complete.');
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setSyncing(false);
      e.target.value = '';
    }
  }

  const curlExample = `curl -X POST "${syncUrl}" \\
  -H "X-Portfolio-Sync-Key: YOUR_KEY" \\
  -H "X-Tenant-Id: ${tenantId}" \\
  -H "X-File-Name: Yardi_RentRoll.csv" \\
  -H "Content-Type: text/csv" \\
  --data-binary @Yardi_RentRoll.csv`;

  return (
    <div className={styles.card} style={{ marginTop: 18 }}>
      <div className={styles.cardHead}>
        <span className={styles.cardTitle}>
          <Icon name="upload" size={16} /> PMS nightly sync
        </span>
        {portfolioSynced
          ? <span className={`${styles.badge} ${styles.badgeGreen}`}>Live data</span>
          : <span className={`${styles.badge} ${styles.badgeAmber}`}>Awaiting first import</span>}
      </div>

      <p className={styles.hint} style={{ marginBottom: 14 }}>
        Works with Yardi, RealPage, AppFolio, Entrata, or any PMS that exports CSV/Excel.
        Schedule a nightly export, then run the upload listener on the PMC&apos;s machine — no Voyager API required.
      </p>

      <div className={styles.field}>
        <label className={styles.label}>Portfolio Sync API key</label>
        <div className={styles.row}>
          <input
            className={styles.input}
            type="password"
            placeholder="Set PORTFOLIO_SYNC_API_KEY in Firebase Functions"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <button className={`${styles.btn} ${styles.btnSm}`} onClick={saveKey}>Save</button>
        </div>
      </div>

      <div className={`${styles.grid} ${styles.cols3}`} style={{ marginTop: 12 }}>
        <div>
          <div className={styles.metricLabel}>Tenant ID</div>
          <code style={{ fontSize: 13 }}>{tenantId}</code>
        </div>
        <div>
          <div className={styles.metricLabel}>Last import</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            {lastImport ? new Date(lastImport).toLocaleString() : 'Never'}
          </div>
          {portfolio?.fileName && <div className={styles.hint}>{portfolio.fileName}</div>}
        </div>
        <div>
          <div className={styles.metricLabel}>Units tracked</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{portfolio?.summary?.totalUnits || 0}</div>
        </div>
      </div>

      <div className={styles.row} style={{ marginTop: 14, gap: 8, flexWrap: 'wrap' }}>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={pullLatest} disabled={syncing}>
          <Icon name="refresh" size={15} /> {syncing ? 'Syncing…' : 'Pull latest from server'}
        </button>
        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={checkStatus} disabled={syncing}>
          Check server status
        </button>
        <label className={`${styles.btn} ${styles.btnGhost}`} style={{ cursor: 'pointer' }}>
          <Icon name="upload" size={15} /> Manual import
          <input type="file" accept=".csv,.xlsx,.xls,.xlsm" style={{ display: 'none' }} onChange={onManualFile} />
        </label>
      </div>

      {msg && <div className={styles.banner} style={{ marginTop: 12 }}><Icon name="check" size={16} /><div>{msg}</div></div>}
      {err && <div className={`${styles.banner} ${styles.bannerRed}`} style={{ marginTop: 12 }}><Icon name="alert" size={16} /><div>{err}</div></div>}
      {status && (
        <div className={styles.hint} style={{ marginTop: 10 }}>
          Server: {status.lastImportAt ? `last upload ${new Date(status.lastImportAt).toLocaleString()}` : 'no uploads yet'}
          {status.history?.length ? ` · ${status.history.length} recent` : ''}
        </div>
      )}

      <div className={styles.sectionTitle} style={{ marginTop: 18 }}>Nightly listener setup</div>
      <ol className={styles.hint} style={{ paddingLeft: 18, lineHeight: 1.6 }}>
        <li>Export rent roll from your PMS nightly (Yardi Voyager → Reports → Rent Roll → CSV).</li>
        <li>Set <code>PORTFOLIO_SYNC_API_KEY</code> in Firebase Functions secrets.</li>
        <li>Run <code>node scripts/nightly-pms-export-upload.mjs</code> via Task Scheduler / cron after the export lands.</li>
        <li>Open the dashboard — data refreshes on next &quot;Pull latest&quot; or page load sync.</li>
      </ol>
      <pre style={{
        fontSize: 11, background: 'rgba(0,0,0,0.25)', padding: 12, borderRadius: 8,
        overflow: 'auto', marginTop: 8, whiteSpace: 'pre-wrap',
      }}>
        {curlExample}
      </pre>
    </div>
  );
}
