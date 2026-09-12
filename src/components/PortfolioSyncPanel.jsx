import { useEffect, useState } from 'react';
import { usePm } from '../context/PmContext';
import { usePmAuth } from '../hooks/usePmAuth';
import Icon from './Icon';
import {
  loadSyncConfig, saveSyncConfig, loadPortfolioFromFirestore, isPmFirebaseConfigured,
} from '../lib/pmAuth';
import { buildSyncInstallerBat, fetchSyncStatus } from '../lib/portfolioSyncApi';
import styles from '../pm.module.css';

const DEFAULT_TIME = '18:15';

export default function PortfolioSyncPanel() {
  const { portfolio, portfolioSynced, importPortfolioFiles, applyPortfolioSnapshot } = usePm();
  const { user, tenantId, loading: authLoading, signIn, signOut } = usePmAuth();
  const [exportFolder, setExportFolder] = useState('');
  const [scheduleTime, setScheduleTime] = useState(DEFAULT_TIME);
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);

  const tid = tenantId || 'demo';
  const lastImport = portfolio?.importedAt;

  useEffect(() => {
    if (!user || !tenantId) return;
    loadSyncConfig(tenantId).then((cfg) => {
      if (cfg?.exportFolder) setExportFolder(cfg.exportFolder);
      if (cfg?.scheduleTime) setScheduleTime(cfg.scheduleTime);
    }).catch(() => {});
    loadPortfolioFromFirestore(tenantId).then((snap) => {
      if (snap) applyPortfolioSnapshot(snap);
    }).catch(() => {});
  }, [user, tenantId, applyPortfolioSnapshot]);

  async function pickFolder() {
    try {
      if (window.showDirectoryPicker) {
        const handle = await window.showDirectoryPicker();
        setExportFolder(handle.name);
        setMsg(`Selected folder: ${handle.name} (enter full path below if needed)`);
      } else {
        setMsg('Enter the full path where Yardi drops the nightly CSV (e.g. C:\\YardiExports).');
      }
    } catch {
      /* user cancelled */
    }
  }

  async function saveSetup() {
    if (!exportFolder.trim()) {
      setErr('Choose or enter the folder where your PMS saves the nightly export.');
      return;
    }
    setSyncing(true);
    setErr(null);
    try {
      await saveSyncConfig(tid, {
        exportFolder: exportFolder.trim(),
        scheduleTime,
        enabled: true,
      });
      setMsg('Nightly sync settings saved. Download the installer below for this PC.');
    } catch (e) {
      setErr(e.message);
    } finally {
      setSyncing(false);
    }
  }

  function downloadInstaller() {
    const bat = buildSyncInstallerBat({ tenantId: tid, exportFolder, scheduleTime });
    const blob = new Blob([bat], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `manydoors-sync-${tid}.bat`;
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg('Installer downloaded. Run once on the PC that receives the nightly Yardi export.');
  }

  async function refreshStatus() {
    try {
      const data = await fetchSyncStatus(tid);
      setServerStatus(data);
      if (data?.snapshot || data?.lastImportAt) {
        const snap = await loadPortfolioFromFirestore(tid);
        if (snap) applyPortfolioSnapshot(snap);
      }
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

  if (!isPmFirebaseConfigured) {
    return (
      <div className={styles.card} style={{ marginTop: 18 }}>
        <div className={styles.cardTitle}>PMS nightly sync</div>
        <p className={styles.hint}>Firebase is not configured in this build — use the document inbox to import CSV files manually.</p>
      </div>
    );
  }

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
        Sign in with Google, pick the folder where Yardi (or any PMS) drops the nightly rent roll,
        and we handle the rest. No database setup per property manager — one tenant, one folder, one schedule.
      </p>

      {!user ? (
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={signIn} disabled={authLoading}>
          <Icon name="users" size={15} /> {authLoading ? 'Loading…' : 'Sign in with Google'}
        </button>
      ) : (
        <>
          <div className={styles.row} style={{ marginBottom: 12, gap: 8, flexWrap: 'wrap' }}>
            <span className={styles.hint}>Signed in as <strong>{user.email}</strong></span>
            <button className={`${styles.btn} ${styles.btnSm} ${styles.btnGhost}`} onClick={signOut}>Sign out</button>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Nightly export folder</label>
            <div className={styles.row}>
              <input
                className={styles.input}
                placeholder="C:\YardiExports"
                value={exportFolder}
                onChange={(e) => setExportFolder(e.target.value)}
              />
              <button type="button" className={`${styles.btn} ${styles.btnSm}`} onClick={pickFolder}>Browse</button>
            </div>
            <div className={styles.hint} style={{ marginTop: 6 }}>
              Point Yardi Voyager scheduled reports to this folder (CSV rent roll).
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Upload time (local)</label>
            <input
              className={styles.input}
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              style={{ maxWidth: 160 }}
            />
            <div className={styles.hint} style={{ marginTop: 6 }}>
              We upload shortly after your PMS export lands (default 6:15 PM).
            </div>
          </div>

          <div className={`${styles.grid} ${styles.cols3}`} style={{ marginTop: 12 }}>
            <div>
              <div className={styles.metricLabel}>Your tenant</div>
              <code style={{ fontSize: 13 }}>{tid}</code>
            </div>
            <div>
              <div className={styles.metricLabel}>Last import</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {lastImport ? new Date(lastImport).toLocaleString() : 'Never'}
              </div>
            </div>
            <div>
              <div className={styles.metricLabel}>Units tracked</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{portfolio?.summary?.totalUnits || 0}</div>
            </div>
          </div>

          <div className={styles.row} style={{ marginTop: 14, gap: 8, flexWrap: 'wrap' }}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={saveSetup} disabled={syncing}>
              Save sync settings
            </button>
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={downloadInstaller} disabled={!exportFolder}>
              Download PC installer
            </button>
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={refreshStatus} disabled={syncing}>
              Refresh status
            </button>
            <label className={`${styles.btn} ${styles.btnGhost}`} style={{ cursor: 'pointer' }}>
              <Icon name="upload" size={15} /> Manual import
              <input type="file" accept=".csv,.xlsx,.xls,.xlsm" style={{ display: 'none' }} onChange={onManualFile} />
            </label>
          </div>
        </>
      )}

      {msg && <div className={styles.banner} style={{ marginTop: 12 }}><Icon name="check" size={16} /><div>{msg}</div></div>}
      {err && <div className={`${styles.banner} ${styles.bannerRed}`} style={{ marginTop: 12 }}><Icon name="alert" size={16} /><div>{err}</div></div>}
      {serverStatus && (
        <div className={styles.hint} style={{ marginTop: 10 }}>
          Server: {serverStatus.lastImportAt ? `last upload ${new Date(serverStatus.lastImportAt).toLocaleString()}` : 'no uploads yet'}
        </div>
      )}

      {user && (
        <div className={styles.hint} style={{ marginTop: 14, lineHeight: 1.6 }}>
          <strong>One-time on the export PC:</strong> download the installer, paste your org upload key once
          (from Google Cloud Secret Manager — ManyDoors sets this up, not each property manager),
          then run the installer. Every new PMC only repeats sign-in + folder + time here.
        </div>
      )}
    </div>
  );
}
