import { useState } from 'react';
import { usePm } from '../context/PmContext';
import Page from '../components/Page';
import Icon from '../components/Icon';
import SetupWizard from '../components/SetupWizard';
import { MANIFESTS, CATEGORY, manifestsByCategory } from '../integrations/registry';
import {
  getStoredOpsKey, setStoredOpsKey, twilioHealth, loadTenantSnapshot,
} from '../lib/opsApi';
import styles from '../pm.module.css';

export default function Settings() {
  const pm = usePm();
  const {
    config, tenant, features, setFeatureEnabled,
    integrations, saveIntegration, disconnectIntegration,
    syncStatus, forceCloudSync, saveSettings, scheduleCloudSync,
  } = pm;
  const [wizard, setWizard] = useState(null);
  const [opsKey, setOpsKey] = useState(() => getStoredOpsKey());
  const [opsMsg, setOpsMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const groups = manifestsByCategory();

  function saveOpsKey() {
    setStoredOpsKey(opsKey.trim());
    setOpsMsg(opsKey.trim() ? 'Ops key saved for this browser session.' : 'Ops key cleared.');
    scheduleCloudSync();
  }

  async function testTwilio() {
    setBusy(true);
    setOpsMsg('');
    try {
      if (opsKey.trim()) setStoredOpsKey(opsKey.trim());
      const res = await twilioHealth();
      setOpsMsg(res.configured
        ? `Twilio configured on server (from ${res.fromNumber}). Dispatch SMS will upgrade receipts from simulated → sent.`
        : 'Ops API reachable, but Twilio secrets are not set on the server yet.');
      if (res.configured) {
        saveIntegration('twilio', {
          status: 'connected',
          message: `Server Twilio ready · ${res.fromNumber}`,
          configuredFields: ['fromNumber'],
        });
      }
    } catch (e) {
      setOpsMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function syncNow() {
    setBusy(true);
    setOpsMsg('');
    try {
      if (opsKey.trim()) setStoredOpsKey(opsKey.trim());
      const res = await forceCloudSync();
      setOpsMsg(res.ok
        ? `Cloud snapshot saved at ${new Date(res.syncedAt || Date.now()).toLocaleString()}.`
        : (res.error || 'Sync failed'));
    } finally {
      setBusy(false);
    }
  }

  async function restoreCloud() {
    setBusy(true);
    setOpsMsg('');
    try {
      if (opsKey.trim()) setStoredOpsKey(opsKey.trim());
      const res = await loadTenantSnapshot(config.defaultTenantId || 'demo');
      if (!res.found || !res.snapshot) {
        setOpsMsg('No cloud snapshot found for this tenant yet. Sync once first.');
        return;
      }
      const snap = res.snapshot;
      if (snap.settings) saveSettings(snap.settings);
      if (Array.isArray(snap.residents)) pm.replaceResidents(snap.residents);
      if (Array.isArray(snap.workOrders)) snap.workOrders.forEach((w) => pm.upsertWorkOrder(w));
      if (Array.isArray(snap.leasingLeads)) snap.leasingLeads.forEach((l) => pm.upsertLeasingLead(l));
      if (Array.isArray(snap.conversations)) snap.conversations.forEach((c) => pm.upsertConversation(c));
      if (Array.isArray(snap.knowledge)) snap.knowledge.forEach((k) => pm.upsertKnowledge(k));
      if (snap.integrations) {
        Object.entries(snap.integrations).forEach(([id, status]) => saveIntegration(id, status));
      }
      setOpsMsg(`Restored cloud snapshot from ${snap.syncedAt ? new Date(snap.syncedAt).toLocaleString() : 'server'}.`);
    } catch (e) {
      setOpsMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page title="Settings & Integrations" subtitle="Connect providers, toggle features per property manager, and manage white-label branding">
      <div className={styles.sectionTitle}>White-label branding</div>
      <div className={`${styles.grid} ${styles.cols3}`}>
        <div className={styles.card}>
          <div className={styles.metricLabel}><Icon name="home" size={14} /> Product</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 6 }}>{config.productName}</div>
          <div className={styles.hint}>{config.productTagline}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.metricLabel}><Icon name="users" size={14} /> Tenant</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 6 }}>{tenant?.name}</div>
          <div className={styles.hint}>{(tenant?.properties || []).length} properties · {config.companyName}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.metricLabel}><Icon name="spark" size={14} /> Accent</div>
          <div className={styles.row} style={{ marginTop: 8 }}>
            <span style={{ width: 22, height: 22, borderRadius: 6, background: config.accent, display: 'inline-block' }} />
            <code style={{ fontSize: 13 }}>{config.accent}</code>
          </div>
          <div className={styles.hint} style={{ marginTop: 6 }}>Set via VITE_PM_* env for each white-label deployment.</div>
        </div>
      </div>

      <div className={styles.sectionTitle}>Persistence & live messaging</div>
      <div className={styles.card}>
        <p className={styles.hint} style={{ marginBottom: 12 }}>
          Demo data always saves in this browser. Paste the same <strong>Social / Ops Admin API key</strong> used for
          Developer Admin social posts to enable Firestore cloud snapshots and real Twilio dispatch SMS via the{' '}
          <code>pmOps</code> function.
        </p>
        <div className={`${styles.grid} ${styles.cols2}`}>
          <div className={styles.field}>
            <label className={styles.label}>Ops Admin API key</label>
            <input
              className={styles.input}
              type="password"
              value={opsKey}
              onChange={(e) => setOpsKey(e.target.value)}
              placeholder="Same as SOCIAL_ADMIN_API_KEY"
              autoComplete="off"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Sync status</label>
            <div style={{ fontSize: 14, marginTop: 8 }}>
              {syncStatus.mode === 'cloud' ? (
                <span className={`${styles.badge} ${styles.badgeGreen}`}>Cloud</span>
              ) : (
                <span className={`${styles.badge} ${styles.badgeGray}`}>Local only</span>
              )}
              {' '}
              {syncStatus.pending && 'Syncing…'}
              {syncStatus.lastSyncedAt && !syncStatus.pending && (
                <span className={styles.hint}> Last sync {new Date(syncStatus.lastSyncedAt).toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>
        <div className={styles.rowWrap}>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={saveOpsKey} disabled={busy}>
            Save key
          </button>
          <button type="button" className={styles.btn} onClick={syncNow} disabled={busy}>
            <Icon name="upload" size={14} /> Sync now
          </button>
          <button type="button" className={styles.btn} onClick={restoreCloud} disabled={busy}>
            <Icon name="download" size={14} /> Restore from cloud
          </button>
          <button type="button" className={styles.btn} onClick={testTwilio} disabled={busy}>
            <Icon name="phone" size={14} /> Test Twilio
          </button>
        </div>
        {opsMsg && (
          <div className={styles.banner} style={{ marginTop: 12 }}>
            <Icon name="check" size={16} style={{ marginTop: 1 }} />
            <div>{opsMsg}</div>
          </div>
        )}
        {syncStatus.error && (
          <div className={`${styles.banner} ${styles.bannerRed}`} style={{ marginTop: 12 }}>
            <Icon name="alert" size={16} style={{ marginTop: 1 }} />
            <div>{syncStatus.error}</div>
          </div>
        )}
      </div>

      <div className={styles.sectionTitle}>Features <span className={styles.hint}>— toggle per property manager</span></div>
      <div className={styles.card}>
        <div className={styles.list}>
          {features.map((f) => (
            <div key={f.id} className={styles.listItem} style={{ cursor: 'default' }}>
              <div style={{ minWidth: 0 }}>
                <div className={styles.itemTitle}><Icon name={f.icon} size={14} /> {f.name} {f.locked && <span className={`${styles.badge} ${styles.badgeGray}`}>core</span>}</div>
                <div className={styles.itemSub} style={{ whiteSpace: 'normal' }}>{f.description}</div>
              </div>
              <div
                className={`${styles.toggle} ${f.enabled ? styles.toggleOn : ''}`}
                onClick={() => !f.locked && setFeatureEnabled(f.id, !f.enabled)}
                role="switch"
                aria-checked={f.enabled}
                style={f.locked ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
              >
                <span className={styles.toggleKnob} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.sectionTitle}>Integrations</div>
      {Object.entries(groups).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 18 }}>
          <div className={styles.hint} style={{ marginBottom: 8, fontWeight: 600 }}>{CATEGORY[cat]}</div>
          <div className={styles.provGrid}>
            {items.map((m) => {
              const conn = integrations[m.id];
              const connected = conn?.status === 'connected';
              const pending = conn?.status === 'pending';
              return (
                <div key={m.id} className={`${styles.provCard} ${connected ? styles.provCardConnected : ''}`}>
                  <div className={styles.provHead}>
                    <span className={styles.provName}>{m.name}</span>
                    {connected ? <span className={`${styles.badge} ${styles.badgeGreen}`}>Connected</span>
                      : pending ? <span className={`${styles.badge} ${styles.badgeAmber}`}>Pending</span>
                      : m.status === 'stub' ? <span className={`${styles.badge} ${styles.badgeGray}`}>Available soon</span>
                      : <span className={`${styles.badge} ${styles.badgeBlue}`}>Available</span>}
                  </div>
                  <div className={styles.provBlurb}>{m.blurb}</div>
                  <button className={`${styles.btn} ${styles.btnSm}`} onClick={() => setWizard(m)} style={{ marginTop: 'auto' }}>
                    {conn ? 'Manage' : 'Connect'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className={styles.banner}>
        <Icon name="bolt" size={16} style={{ marginTop: 1 }} />
        <div>
          Every integration above is defined by a manifest, so the wizard renders itself. Adding a new provider later =
          add one manifest (and a real adapter when sandbox credentials are available) — no other UI changes. {MANIFESTS.length} providers registered.
          Twilio can also be activated via <strong>Test Twilio</strong> above when server secrets are present.
        </div>
      </div>

      {wizard && (
        <SetupWizard
          manifest={wizard}
          existing={integrations[wizard.id]}
          onConnect={saveIntegration}
          onDisconnect={disconnectIntegration}
          onClose={() => setWizard(null)}
        />
      )}
    </Page>
  );
}
