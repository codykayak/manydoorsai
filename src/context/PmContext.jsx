/**
 * Central context for the Property Management module.
 *
 * Owns the active tenant, the tenant-scoped store, feature flags, demo role
 * (PM vs Owner), guided-tour state, action-receipt wrappers, and optional
 * cloud sync via the pmOps Cloud Function.
 */

import { createContext, useContext, useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { createStore, now } from '../data/store';
import { resolveFeatures } from '../config/featureRegistry';
import APP_CONFIG from '../config/appConfig';
import {
  seedSettings, seedKnowledge, seedResidents,
  seedConversations, seedLeasingLeads, seedWorkOrders,
} from '../data/seed';
import { importResidentsFromFile } from '../integrations/adapters/fileImport';
import {
  buildDispatchReceipts,
  buildSelfHelpReceipt,
  buildLeasingStageReceipt,
  suggestTourSlot,
} from '../lib/actionReceipts';
import { syncTenantSnapshot, notifyDispatch, getStoredOpsKey } from '../lib/opsApi';

const PmContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export function usePm() {
  const ctx = useContext(PmContext);
  if (!ctx) throw new Error('usePm must be used within <PmProvider>');
  return ctx;
}

/** Seed the demo tenant on first run, then return the full initial snapshot. */
function bootstrap(store) {
  let settings = store.getSettings();
  if (settings && settings.onboardingComplete === undefined && settings.onboardedAt) {
    settings = { ...settings, onboardingComplete: true };
    store.saveSettings(settings);
  }
  if (!settings) {
    settings = seedSettings();
    store.saveSettings(settings);
    store.saveList('knowledge', seedKnowledge());
    store.saveList('residents', seedResidents());
    store.saveList('conversations', seedConversations());
    store.saveList('leasingLeads', seedLeasingLeads());
    store.saveList('workOrders', seedWorkOrders());
  }
  if (settings.demoRole === undefined) {
    settings = { ...settings, demoRole: 'pm', tourComplete: settings.tourComplete || false };
    store.saveSettings(settings);
  }
  return {
    settings,
    residents: store.residents(),
    conversations: store.conversations(),
    leasingLeads: store.leasingLeads(),
    workOrders: store.workOrders(),
    knowledge: store.knowledge(),
    integrations: store.getIntegrations(),
  };
}

function buildCloudSnapshot(settings, collections) {
  return {
    settings,
    residents: collections.residents,
    conversations: collections.conversations,
    leasingLeads: collections.leasingLeads,
    workOrders: collections.workOrders,
    knowledge: collections.knowledge,
    integrations: collections.integrations,
  };
}

export function PmProvider({ children }) {
  const tenantId = APP_CONFIG.defaultTenantId;
  const store = useMemo(() => createStore(tenantId), [tenantId]);
  const [snapshot] = useState(() => bootstrap(store));

  const [settings, setSettings] = useState(snapshot.settings);
  const [residents, setResidents] = useState(snapshot.residents);
  const [conversations, setConversations] = useState(snapshot.conversations);
  const [leasingLeads, setLeasingLeads] = useState(snapshot.leasingLeads);
  const [workOrders, setWorkOrders] = useState(snapshot.workOrders);
  const [knowledge, setKnowledge] = useState(snapshot.knowledge);
  const [integrations, setIntegrations] = useState(snapshot.integrations);
  const [syncStatus, setSyncStatus] = useState({
    mode: 'local',
    lastSyncedAt: null,
    error: null,
    pending: false,
  });
  const [tourOpen, setTourOpen] = useState(false);
  const syncTimer = useRef(null);
  const latestRef = useRef({});

  latestRef.current = {
    settings, residents, conversations, leasingLeads, workOrders, knowledge, integrations,
  };

  const features = useMemo(
    () => resolveFeatures(settings?.features || {}),
    [settings],
  );
  const featureMap = useMemo(
    () => Object.fromEntries(features.map((f) => [f.id, f])),
    [features],
  );

  const scheduleCloudSync = useCallback(() => {
    if (!getStoredOpsKey()) {
      setSyncStatus((s) => ({ ...s, mode: 'local', pending: false }));
      return;
    }
    setSyncStatus((s) => ({ ...s, pending: true, mode: 'cloud', error: null }));
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      const snap = buildCloudSnapshot(
        latestRef.current.settings,
        latestRef.current,
      );
      try {
        const res = await syncTenantSnapshot(tenantId, snap);
        setSyncStatus({
          mode: 'cloud',
          lastSyncedAt: res.syncedAt || now(),
          error: null,
          pending: false,
        });
        setSettings((prev) => {
          const next = { ...prev, lastCloudSyncAt: res.syncedAt || now() };
          store.saveSettings(next);
          return next;
        });
      } catch (e) {
        setSyncStatus((s) => ({
          ...s,
          mode: getStoredOpsKey() ? 'cloud' : 'local',
          pending: false,
          error: e.message,
        }));
      }
    }, 1200);
  }, [store, tenantId]);

  useEffect(() => () => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
  }, []);

  useEffect(() => {
    if (getStoredOpsKey()) {
      setSyncStatus((s) => ({ ...s, mode: 'cloud' }));
    }
  }, []);

  const saveSettings = useCallback((next) => {
    store.saveSettings(next);
    setSettings({ ...next });
    scheduleCloudSync();
  }, [store, scheduleCloudSync]);

  const setFeatureEnabled = useCallback((featureId, enabled) => {
    setSettings((prev) => {
      const next = { ...prev, features: { ...prev.features, [featureId]: { ...prev.features?.[featureId], enabled } } };
      store.saveSettings(next);
      scheduleCloudSync();
      return next;
    });
  }, [store, scheduleCloudSync]);

  const setFeatureConfig = useCallback((featureId, configPatch) => {
    setSettings((prev) => {
      const current = prev.features?.[featureId] || {};
      const next = {
        ...prev,
        features: {
          ...prev.features,
          [featureId]: { ...current, config: { ...(current.config || {}), ...configPatch } },
        },
      };
      store.saveSettings(next);
      scheduleCloudSync();
      return next;
    });
  }, [store, scheduleCloudSync]);

  const setDemoRole = useCallback((role) => {
    setSettings((prev) => {
      const next = { ...prev, demoRole: role === 'owner' ? 'owner' : 'pm' };
      store.saveSettings(next);
      return next;
    });
  }, [store]);

  const completeTour = useCallback(() => {
    setTourOpen(false);
    setSettings((prev) => {
      const next = { ...prev, tourComplete: true };
      store.saveSettings(next);
      return next;
    });
  }, [store]);

  const startTour = useCallback(() => setTourOpen(true), []);

  const completeOnboarding = useCallback(async (payload = {}) => {
    const properties = (payload.properties || [])
      .filter((p) => p?.name)
      .map((p, i) => ({
        id: p.id || `p_onboard_${Date.now().toString(36)}_${i}`,
        name: p.name,
        units: Number(p.units) || 0,
        city: p.city || '',
        state: p.state || 'OR',
      }));

    setSettings((prev) => {
      const maint = prev.features?.maintenance || {};
      const next = {
        ...prev,
        onboardingComplete: true,
        companyProfile: {
          contactName: payload.contactName || '',
          phone: payload.phone || '',
          email: payload.email || '',
          spreadsheetName: payload.spreadsheetName || '',
        },
        tenant: {
          ...(prev.tenant || { id: tenantId, branding: { accent: '#f5a623' } }),
          name: payload.companyName || prev.tenant?.name || 'My Portfolio',
          properties: properties.length ? properties : (prev.tenant?.properties || []),
        },
        features: {
          ...prev.features,
          maintenance: {
            ...maint,
            config: {
              ...(maint.config || {}),
              technicians: payload.technicians || maint.config?.technicians || [],
              onCallTechId: payload.onCallTechId || maint.config?.onCallTechId || null,
            },
          },
        },
      };
      store.saveSettings(next);
      return next;
    });

    if (payload.spreadsheetFile) {
      try {
        const rows = await importResidentsFromFile(payload.spreadsheetFile);
        if (rows.length) {
          store.saveList('residents', rows);
          setResidents(rows);
        }
      } catch (e) {
        console.warn('[pm] onboarding spreadsheet import failed', e);
      }
    }

    scheduleCloudSync();
    // Offer guided tour after first onboarding.
    setTimeout(() => setTourOpen(true), 400);
  }, [store, tenantId, scheduleCloudSync]);

  const upsertResident = useCallback((item) => {
    const saved = store.upsert('residents', item);
    setResidents(store.list('residents'));
    scheduleCloudSync();
    return saved;
  }, [store, scheduleCloudSync]);

  const removeResident = useCallback((id) => {
    store.remove('residents', id);
    setResidents(store.list('residents'));
    scheduleCloudSync();
  }, [store, scheduleCloudSync]);

  const replaceResidents = useCallback((items) => {
    store.saveList('residents', items);
    setResidents(items);
    scheduleCloudSync();
  }, [store, scheduleCloudSync]);

  const upsertConversation = useCallback((item) => {
    const saved = store.upsert('conversations', item);
    setConversations(store.list('conversations'));
    scheduleCloudSync();
    return saved;
  }, [store, scheduleCloudSync]);

  const upsertKnowledge = useCallback((item) => {
    const saved = store.upsert('knowledge', item);
    setKnowledge(store.list('knowledge'));
    scheduleCloudSync();
    return saved;
  }, [store, scheduleCloudSync]);

  const removeKnowledge = useCallback((id) => {
    store.remove('knowledge', id);
    setKnowledge(store.list('knowledge'));
    scheduleCloudSync();
  }, [store, scheduleCloudSync]);

  const upsertLeasingLead = useCallback((item) => {
    const prev = item.id ? store.list('leasingLeads').find((l) => l.id === item.id) : null;
    let next = { ...item };
    if (prev && prev.stage !== next.stage) {
      if (next.stage === 'tour' && !next.tourSlot) {
        next.tourSlot = suggestTourSlot();
      }
      const receipt = buildLeasingStageReceipt(prev.stage, next.stage, next);
      next.history = [...(prev.history || []), receipt];
    } else if (!prev) {
      next.history = [
        buildLeasingStageReceipt(null, next.stage || 'new', next),
      ];
    }
    const saved = store.upsert('leasingLeads', next);
    setLeasingLeads(store.list('leasingLeads'));
    scheduleCloudSync();
    return saved;
  }, [store, scheduleCloudSync]);

  const upgradeReceiptsAfterLiveSms = useCallback((workOrderId, smsResult) => {
    setWorkOrders((prev) => {
      const list = prev.map((wo) => {
        if (wo.id !== workOrderId) return wo;
        const receipts = (wo.receipts || []).map((r) => {
          if (r.channel !== 'sms' || r.action !== 'on_call_notify') return r;
          return {
            ...r,
            status: smsResult.sent ? 'sent' : 'failed',
            externalId: smsResult.sid || r.externalId,
            detail: smsResult.sent ? r.detail : `${r.detail} (${smsResult.reason || 'send failed'})`,
          };
        });
        const updated = { ...wo, receipts };
        store.upsert('workOrders', updated);
        return updated;
      });
      return list;
    });
    scheduleCloudSync();
  }, [store, scheduleCloudSync]);

  const upsertWorkOrder = useCallback((item) => {
    const prev = item.id ? store.list('workOrders').find((w) => w.id === item.id) : null;
    let next = { ...item };
    const becomingDispatched = next.status === 'dispatched' && prev?.status !== 'dispatched';
    const newDispatched = !prev && next.status === 'dispatched';
    const newSelfHelp = !prev && next.status === 'self-help-sent' && next.selfHelp;

    if (becomingDispatched || newDispatched) {
      const maintCfg = latestRef.current.settings?.features?.maintenance?.config || {};
      const companyPhone = latestRef.current.settings?.companyProfile?.phone;
      const receipts = buildDispatchReceipts(
        next,
        {
          technicians: maintCfg.technicians || [],
          onCallTechId: maintCfg.onCallTechId,
          companyPhone,
        },
        latestRef.current.integrations,
      );
      next.receipts = [...(prev?.receipts || next.receipts || []), ...receipts];
    } else if (newSelfHelp) {
      next.receipts = [...(next.receipts || []), buildSelfHelpReceipt(next)];
    }

    const saved = store.upsert('workOrders', next);
    setWorkOrders(store.list('workOrders'));
    scheduleCloudSync();

    if ((becomingDispatched || newDispatched) && getStoredOpsKey()) {
      const smsReceipt = (saved.receipts || []).find((r) => r.channel === 'sms' && r.action === 'on_call_notify');
      const toRaw = smsReceipt?.to || '';
      const phoneMatch = toRaw.match(/\+?[\d\s().-]{10,}/);
      const to = phoneMatch ? phoneMatch[0].trim() : toRaw;
      notifyDispatch({
        to,
        body: smsReceipt?.detail || `Dispatch: ${saved.issue}`,
        workOrderId: saved.id,
        unit: saved.unit,
      })
        .then((res) => upgradeReceiptsAfterLiveSms(saved.id, res))
        .catch(() => {
          /* local simulated receipt remains */
        });
    }

    return saved;
  }, [store, scheduleCloudSync, upgradeReceiptsAfterLiveSms]);

  const saveIntegration = useCallback((id, statusObj) => {
    setIntegrations((prev) => {
      const next = { ...prev, [id]: { ...statusObj, connectedAt: Date.now() } };
      store.saveIntegrations(next);
      scheduleCloudSync();
      return next;
    });
  }, [store, scheduleCloudSync]);

  const disconnectIntegration = useCallback((id) => {
    setIntegrations((prev) => {
      const next = { ...prev };
      delete next[id];
      store.saveIntegrations(next);
      scheduleCloudSync();
      return next;
    });
  }, [store, scheduleCloudSync]);

  const forceCloudSync = useCallback(async () => {
    if (!getStoredOpsKey()) {
      setSyncStatus((s) => ({ ...s, error: 'Add an Ops Admin API key in Settings first.', mode: 'local' }));
      return { ok: false };
    }
    setSyncStatus((s) => ({ ...s, pending: true, error: null, mode: 'cloud' }));
    try {
      const snap = buildCloudSnapshot(latestRef.current.settings, latestRef.current);
      const res = await syncTenantSnapshot(tenantId, snap);
      setSyncStatus({
        mode: 'cloud',
        lastSyncedAt: res.syncedAt || now(),
        error: null,
        pending: false,
      });
      return { ok: true, ...res };
    } catch (e) {
      setSyncStatus((s) => ({ ...s, pending: false, error: e.message }));
      return { ok: false, error: e.message };
    }
  }, [tenantId]);

  const value = {
    config: APP_CONFIG,
    tenant: settings?.tenant ?? null,
    settings,
    saveSettings,
    features,
    featureMap,
    setFeatureEnabled,
    setFeatureConfig,
    // onboarding / tour / role
    onboardingComplete: Boolean(settings?.onboardingComplete),
    completeOnboarding,
    demoRole: settings?.demoRole === 'owner' ? 'owner' : 'pm',
    setDemoRole,
    tourComplete: Boolean(settings?.tourComplete),
    tourOpen,
    setTourOpen,
    startTour,
    completeTour,
    // persistence
    syncStatus,
    forceCloudSync,
    scheduleCloudSync,
    // collections
    residents,
    conversations,
    leasingLeads,
    workOrders,
    knowledge,
    integrations,
    // mutators
    upsertResident,
    removeResident,
    replaceResidents,
    upsertConversation,
    upsertLeasingLead,
    upsertWorkOrder,
    upsertKnowledge,
    removeKnowledge,
    saveIntegration,
    disconnectIntegration,
  };

  return <PmContext.Provider value={value}>{children}</PmContext.Provider>;
}

export default PmProvider;
