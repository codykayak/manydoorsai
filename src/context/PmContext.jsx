/**
 * Central context for the Property Management module.
 *
 * Owns the active tenant, the tenant-scoped store, feature flags, and all the
 * collections used across pages. First load seeds the demo tenant so the
 * build-and-pitch experience is populated immediately.
 *
 * Bootstrapping (seed-if-empty + initial read) happens synchronously in lazy
 * state initializers — the local store is synchronous, so no effect is needed.
 */

import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { createStore } from '../data/store';
import { resolveFeatures } from '../config/featureRegistry';
import APP_CONFIG from '../config/appConfig';
import {
  loadLocalPropertyProfile,
  saveLocalPropertyProfile,
  profileFromOnboarding,
  DEFAULT_PROPERTY_PROFILE,
} from '../lib/propertyProfile';
import {
  seedSettings, seedKnowledge, seedResidents,
  seedConversations, seedLeasingLeads, seedWorkOrders,
} from '../data/seed';

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

  const features = useMemo(
    () => resolveFeatures(settings?.features || {}),
    [settings],
  );
  const featureMap = useMemo(
    () => Object.fromEntries(features.map((f) => [f.id, f])),
    [features],
  );

  // ── Mutators (persist + update state) ──────────────────────────────────────
  const saveSettings = useCallback((next) => {
    store.saveSettings(next);
    setSettings({ ...next });
  }, [store]);

  const setFeatureEnabled = useCallback((featureId, enabled) => {
    setSettings((prev) => {
      const next = { ...prev, features: { ...prev.features, [featureId]: { ...prev.features?.[featureId], enabled } } };
      store.saveSettings(next);
      return next;
    });
  }, [store]);

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
      return next;
    });
  }, [store]);

  const upsertCollection = useCallback((collection, setter) => (item) => {
    const saved = store.upsert(collection, item);
    setter(store.list(collection));
    return saved;
  }, [store]);

  const removeFromCollection = useCallback((collection, setter) => (id) => {
    store.remove(collection, id);
    setter(store.list(collection));
  }, [store]);

  const replaceCollection = useCallback((collection, setter) => (items) => {
    store.saveList(collection, items);
    setter(items);
  }, [store]);

  const saveIntegration = useCallback((id, statusObj) => {
    setIntegrations((prev) => {
      const next = { ...prev, [id]: { ...statusObj, connectedAt: Date.now() } };
      store.saveIntegrations(next);
      return next;
    });
  }, [store]);

  const disconnectIntegration = useCallback((id) => {
    setIntegrations((prev) => {
      const next = { ...prev };
      delete next[id];
      store.saveIntegrations(next);
      return next;
    });
  }, [store]);

  const [propertyProfile, setPropertyProfile] = useState(
    () => settings?.propertyProfile || loadLocalPropertyProfile(),
  );

  const syncKnowledgeFromProfile = useCallback((profile) => {
    if (!profile) return;
    const poolAnswer = profile.pool?.enabled
      ? `The pool is open ${profile.pool.daysOpen} from ${profile.pool.openTime} to ${profile.pool.closeTime} (${profile.pool.seasonLabel}). ${profile.pool.rules}`
      : 'The pool is closed for the season.';
    const officeAnswer = `Leasing office hours: Mon–Fri ${profile.leasing?.weekdays}, Sat ${profile.leasing?.saturday}, Sun ${profile.leasing?.sunday}. Phone: ${profile.leasing?.phone || profile.phone || 'see leasing office'}.`;

    const patchKb = (question, answer, tags) => {
      const list = store.knowledge();
      const existing = list.find((k) => k.question.toLowerCase() === question.toLowerCase());
      if (existing) {
        store.upsert('knowledge', { ...existing, answer, tags });
      } else {
        store.upsert('knowledge', { question, answer, tags, createdAt: Date.now() });
      }
    };

    patchKb('What are the pool hours?', poolAnswer, ['pool', 'amenity', 'hours']);
    patchKb('What are the office hours?', officeAnswer, ['office', 'hours', 'leasing']);
    if (profile.petPolicy) patchKb('What is the pet policy?', profile.petPolicy, ['pet', 'policy']);
    if (profile.amenities) {
      patchKb('What amenities are available?', profile.amenities, ['amenity', 'fitness', 'pool']);
    }
    setKnowledge(store.knowledge());
  }, [store]);

  const savePropertyProfile = useCallback((next) => {
    const merged = { ...DEFAULT_PROPERTY_PROFILE, ...next, updatedAt: Date.now() };
    saveLocalPropertyProfile(merged);
    setPropertyProfile(merged);
    setSettings((prev) => {
      const settingsNext = { ...prev, propertyProfile: merged };
      store.saveSettings(settingsNext);
      return settingsNext;
    });
    syncKnowledgeFromProfile(merged);
    return merged;
  }, [store, syncKnowledgeFromProfile]);

  const completeOnboarding = useCallback((payload) => {
    const profile = profileFromOnboarding(payload, propertyProfile);
    savePropertyProfile(profile);

    setSettings((prev) => {
      const techs = payload.technicians || prev.features?.maintenance?.config?.technicians || [];
      const onCallTechId = payload.onCallTechId || techs[0]?.id || null;
      const tenant = {
        ...prev.tenant,
        name: payload.companyName || prev.tenant?.name,
        properties: payload.properties?.length
          ? payload.properties.map((p, i) => ({
            id: p.id || `p_onboard_${i}`,
            name: p.name,
            units: Number(p.units) || 0,
            city: p.city || profile.city || '',
            state: p.state || profile.state || 'OR',
          }))
          : prev.tenant?.properties,
      };
      const next = {
        ...prev,
        tenant,
        onboardingComplete: true,
        onboardedAt: Date.now(),
        features: {
          ...prev.features,
          maintenance: {
            ...prev.features?.maintenance,
            config: {
              ...(prev.features?.maintenance?.config || {}),
              technicians: techs,
              onCallTechId,
            },
          },
        },
        propertyProfile: profile,
      };
      store.saveSettings(next);
      return next;
    });
  }, [propertyProfile, savePropertyProfile, store]);

  const onboardingComplete = Boolean(settings?.onboardingComplete);

  const value = {
    config: APP_CONFIG,
    tenant: settings?.tenant ?? null,
    settings,
    saveSettings,
    propertyProfile,
    savePropertyProfile,
    onboardingComplete,
    completeOnboarding,
    features,
    featureMap,
    setFeatureEnabled,
    setFeatureConfig,
    // collections
    residents,
    conversations,
    leasingLeads,
    workOrders,
    knowledge,
    integrations,
    // mutators
    upsertResident: upsertCollection('residents', setResidents),
    removeResident: removeFromCollection('residents', setResidents),
    replaceResidents: replaceCollection('residents', setResidents),
    upsertConversation: upsertCollection('conversations', setConversations),
    upsertLeasingLead: upsertCollection('leasingLeads', setLeasingLeads),
    upsertWorkOrder: upsertCollection('workOrders', setWorkOrders),
    upsertKnowledge: upsertCollection('knowledge', setKnowledge),
    removeKnowledge: removeFromCollection('knowledge', setKnowledge),
    saveIntegration,
    disconnectIntegration,
  };

  return <PmContext.Provider value={value}>{children}</PmContext.Provider>;
}

export default PmProvider;
