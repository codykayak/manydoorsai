import { useState } from 'react';
import Icon from './Icon';
import { DEFAULT_PROPERTY_PROFILE } from '../lib/propertyProfile';
import styles from '../pm.module.css';

const STEPS = ['welcome', 'company', 'property', 'pool', 'leasing', 'volume', 'maintenance', 'done'];

function initFromProfile(profile, defaultTechnicians) {
  const p = profile || DEFAULT_PROPERTY_PROFILE;
  return {
    step: 0,
    companyName: p.companyName || '',
    contactName: p.contactName || '',
    phone: p.phone || '',
    email: p.email || '',
    propertyName: p.propertyName || '',
    propertyUnits: String(p.unitCount || ''),
    address: p.address || '',
    city: p.city || '',
    state: p.state || 'OR',
    pool: { ...DEFAULT_PROPERTY_PROFILE.pool, ...p.pool },
    leasing: { ...DEFAULT_PROPERTY_PROFILE.leasing, ...p.leasing },
    estimatedMonthlyCalls: String(p.estimatedMonthlyCalls || 450),
    estimatedAppsPerMonth: String(p.estimatedAppsPerMonth || 35),
    estimatedMaintenanceCallsPerMonth: String(p.estimatedMaintenanceCallsPerMonth || 180),
    amenities: p.amenities || DEFAULT_PROPERTY_PROFILE.amenities,
    petPolicy: p.petPolicy || DEFAULT_PROPERTY_PROFILE.petPolicy,
    spreadsheetName: '',
    techInput: '',
    technicians: defaultTechnicians || [],
    onCallTechId: defaultTechnicians?.[0]?.id || '',
  };
}

export default function OnboardingWizard({ open, onClose, onComplete, defaultTechnicians, initialProfile }) {
  const [form, setForm] = useState(() => initFromProfile(initialProfile, defaultTechnicians));
  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  if (!open) return null;

  const {
    step, companyName, contactName, phone, email, propertyName, propertyUnits,
    address, city, state, pool, leasing, estimatedMonthlyCalls, estimatedAppsPerMonth,
    estimatedMaintenanceCallsPerMonth, amenities, petPolicy, spreadsheetName,
    techInput, technicians, onCallTechId,
  } = form;

  const stepId = STEPS[step];
  const onCall = technicians.find((t) => t.id === onCallTechId) || technicians[0];
  const progress = ((step + 1) / STEPS.length) * 100;

  function addTech() {
    const name = techInput.trim();
    if (!name) return;
    const id = `tech_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const next = [...technicians, { id, name, phone: '' }];
    set({
      technicians: next,
      onCallTechId: onCallTechId || id,
      techInput: '',
    });
  }

  function removeTech(id) {
    const next = technicians.filter((t) => t.id !== id);
    set({
      technicians: next,
      onCallTechId: onCallTechId === id ? (next[0]?.id || '') : onCallTechId,
    });
  }

  function finish() {
    onComplete({
      companyName: companyName.trim() || 'My Portfolio',
      contactName: contactName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      spreadsheetName: spreadsheetName.trim(),
      propertyName: propertyName.trim(),
      properties: propertyName.trim()
        ? [{ name: propertyName.trim(), units: Number(propertyUnits) || 0, city, state }]
        : [],
      pool,
      leasing: { ...leasing, phone: leasing.phone || phone.trim(), email: leasing.email || email.trim() },
      amenities,
      petPolicy,
      address,
      city,
      state,
      estimatedMonthlyCalls: Number(estimatedMonthlyCalls) || 0,
      estimatedAppsPerMonth: Number(estimatedAppsPerMonth) || 0,
      estimatedMaintenanceCallsPerMonth: Number(estimatedMaintenanceCallsPerMonth) || 0,
      technicians,
      onCallTechId: onCallTechId || technicians[0]?.id || null,
    });
    onClose();
  }

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Onboarding">
      <div className={styles.modalLarge}>
        <div className={styles.modalHead}>
          <div>
            <div className={styles.pageTitle}>Get your portfolio ready</div>
            <div className={styles.pageSub}>Step {step + 1} of {STEPS.length}</div>
            <div className={styles.onboardProgress} aria-hidden="true">
              <div className={styles.onboardProgressBar} style={{ width: `${progress}%` }} />
            </div>
          </div>
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={styles.modalBody}>
          {stepId === 'welcome' && (
            <>
              <p className={styles.onboardLead}>
                We&apos;ll collect property details, pool and leasing hours, call volume, and on-call maintenance
                contacts so your AI assistant answers accurately — including on live phone calls soon.
              </p>
              <ul className={styles.onboardList}>
                <li><strong>Maintenance triage</strong> — emergencies route to your on-call tech.</li>
                <li><strong>Resident & prospect answers</strong> — pool hours, leasing, and availability from your data.</li>
                <li><strong>Savings calculator</strong> — pre-filled with your unit count and call volume.</li>
              </ul>
              <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => set({ step: 1 })}>
                Continue →
              </button>
            </>
          )}

          {stepId === 'company' && (
            <>
              <div className={`${styles.grid} ${styles.cols2}`}>
                <div className={styles.field}>
                  <label className={styles.label}>Company / portfolio name</label>
                  <input className={styles.input} value={companyName} onChange={(e) => set({ companyName: e.target.value })} placeholder="e.g. Maple Grove Residential" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Your name</label>
                  <input className={styles.input} value={contactName} onChange={(e) => set({ contactName: e.target.value })} placeholder="Property manager" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Phone (call forwarding)</label>
                  <input className={styles.input} type="tel" value={phone} onChange={(e) => set({ phone: e.target.value })} placeholder="(541) 555-0100" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Email</label>
                  <input className={styles.input} type="email" value={email} onChange={(e) => set({ email: e.target.value })} placeholder="you@company.com" />
                </div>
              </div>
              <div className={styles.rowWrap} style={{ marginTop: 16 }}>
                <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => set({ step: 2 })}>Next →</button>
                <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => set({ step: 0 })}>Back</button>
              </div>
            </>
          )}

          {stepId === 'property' && (
            <>
              <div className={`${styles.grid} ${styles.cols2}`}>
                <div className={styles.field}>
                  <label className={styles.label}>Property name</label>
                  <input className={styles.input} value={propertyName} onChange={(e) => set({ propertyName: e.target.value })} placeholder="Riverbend Commons" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Units</label>
                  <input className={styles.input} type="number" min="0" value={propertyUnits} onChange={(e) => set({ propertyUnits: e.target.value })} placeholder="96" />
                </div>
                <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.label}>Street address</label>
                  <input className={styles.input} value={address} onChange={(e) => set({ address: e.target.value })} placeholder="123 Main St" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>City</label>
                  <input className={styles.input} value={city} onChange={(e) => set({ city: e.target.value })} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>State</label>
                  <input className={styles.input} value={state} onChange={(e) => set({ state: e.target.value })} />
                </div>
              </div>
              <div className={styles.field} style={{ marginTop: 12 }}>
                <label className={styles.label}>Upload spreadsheet (optional)</label>
                <input className={styles.input} type="file" accept=".csv,.xlsx,.xls,.xlsm" onChange={(e) => set({ spreadsheetName: e.target.files?.[0]?.name || '' })} />
                {spreadsheetName && <p className={styles.hint} style={{ marginTop: 6 }}>Selected: {spreadsheetName}</p>}
              </div>
              <div className={styles.rowWrap} style={{ marginTop: 16 }}>
                <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => set({ step: 3 })}>Next →</button>
                <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => set({ step: 1 })}>Back</button>
              </div>
            </>
          )}

          {stepId === 'pool' && (
            <>
              <label className={styles.checkRow}>
                <input type="checkbox" checked={pool.enabled} onChange={(e) => set({ pool: { ...pool, enabled: e.target.checked } })} />
                Pool open this season
              </label>
              <div className={`${styles.grid} ${styles.cols2}`}>
                <div className={styles.field}>
                  <label className={styles.label}>Season</label>
                  <input className={styles.input} value={pool.seasonLabel} onChange={(e) => set({ pool: { ...pool, seasonLabel: e.target.value } })} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Days open</label>
                  <input className={styles.input} value={pool.daysOpen} onChange={(e) => set({ pool: { ...pool, daysOpen: e.target.value } })} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Opens</label>
                  <input className={styles.input} value={pool.openTime} onChange={(e) => set({ pool: { ...pool, openTime: e.target.value } })} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Closes</label>
                  <input className={styles.input} value={pool.closeTime} onChange={(e) => set({ pool: { ...pool, closeTime: e.target.value } })} />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Pool rules</label>
                <textarea className={styles.textarea} rows={3} value={pool.rules} onChange={(e) => set({ pool: { ...pool, rules: e.target.value } })} />
              </div>
              <div className={styles.rowWrap} style={{ marginTop: 16 }}>
                <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => set({ step: 4 })}>Next →</button>
                <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => set({ step: 2 })}>Back</button>
              </div>
            </>
          )}

          {stepId === 'leasing' && (
            <>
              <div className={`${styles.grid} ${styles.cols2}`}>
                <div className={styles.field}>
                  <label className={styles.label}>Weekday hours</label>
                  <input className={styles.input} value={leasing.weekdays} onChange={(e) => set({ leasing: { ...leasing, weekdays: e.target.value } })} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Saturday</label>
                  <input className={styles.input} value={leasing.saturday} onChange={(e) => set({ leasing: { ...leasing, saturday: e.target.value } })} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Sunday</label>
                  <input className={styles.input} value={leasing.sunday} onChange={(e) => set({ leasing: { ...leasing, sunday: e.target.value } })} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Tour booking URL</label>
                  <input className={styles.input} value={leasing.tourBookingUrl} onChange={(e) => set({ leasing: { ...leasing, tourBookingUrl: e.target.value } })} placeholder="https://..." />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Amenities (for AI answers)</label>
                <textarea className={styles.textarea} rows={2} value={amenities} onChange={(e) => set({ amenities: e.target.value })} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Pet policy</label>
                <textarea className={styles.textarea} rows={2} value={petPolicy} onChange={(e) => set({ petPolicy: e.target.value })} />
              </div>
              <div className={styles.rowWrap} style={{ marginTop: 16 }}>
                <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => set({ step: 5 })}>Next →</button>
                <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => set({ step: 3 })}>Back</button>
              </div>
            </>
          )}

          {stepId === 'volume' && (
            <>
              <p className={styles.hint} style={{ marginBottom: 12 }}>These defaults feed the Savings calculator and ROI projections.</p>
              <div className={`${styles.grid} ${styles.cols2}`}>
                <div className={styles.field}>
                  <label className={styles.label}>Estimated calls / month</label>
                  <input className={styles.input} type="number" value={estimatedMonthlyCalls} onChange={(e) => set({ estimatedMonthlyCalls: e.target.value })} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Rental applications / month</label>
                  <input className={styles.input} type="number" value={estimatedAppsPerMonth} onChange={(e) => set({ estimatedAppsPerMonth: e.target.value })} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Maintenance calls / month</label>
                  <input className={styles.input} type="number" value={estimatedMaintenanceCallsPerMonth} onChange={(e) => set({ estimatedMaintenanceCallsPerMonth: e.target.value })} />
                </div>
              </div>
              <div className={styles.rowWrap} style={{ marginTop: 16 }}>
                <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => set({ step: 6 })}>Next →</button>
                <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => set({ step: 4 })}>Back</button>
              </div>
            </>
          )}

          {stepId === 'maintenance' && (
            <>
              <p className={styles.hint} style={{ marginBottom: 12 }}>
                Add maintenance technicians and choose who is <strong>on call</strong> for emergencies.
              </p>
              <div className={styles.rowWrap} style={{ marginBottom: 12 }}>
                <input className={styles.input} value={techInput} onChange={(e) => set({ techInput: e.target.value })} placeholder="Technician name" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())} />
                <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={addTech}>
                  <Icon name="plus" size={14} /> Add tech
                </button>
              </div>
              {technicians.length > 0 && (
                <ul className={styles.techList}>
                  {technicians.map((t) => (
                    <li key={t.id} className={styles.techListItem}>
                      <span>{t.name}</span>
                      <button type="button" className={`${styles.btn} ${styles.btnSm} ${styles.btnGhost}`} onClick={() => removeTech(t.id)}>Remove</button>
                    </li>
                  ))}
                </ul>
              )}
              <div className={styles.field} style={{ marginTop: 14 }}>
                <label className={styles.label}>On-call tech</label>
                <select className={styles.select} value={onCallTechId} onChange={(e) => set({ onCallTechId: e.target.value })} disabled={!technicians.length}>
                  {!technicians.length && <option value="">Add a technician first</option>}
                  {technicians.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              {onCall && (
                <div className={`${styles.banner} ${styles.bannerRed}`} style={{ marginTop: 12 }}>
                  <Icon name="alert" size={16} style={{ marginTop: 1 }} />
                  <div>Emergency calls forward to <strong>{onCall.name}</strong> labeled <strong>EMERGENCY</strong>.</div>
                </div>
              )}
              <div className={styles.rowWrap} style={{ marginTop: 16 }}>
                <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => set({ step: 7 })} disabled={!technicians.length}>Finish →</button>
                <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => set({ step: 5 })}>Back</button>
              </div>
            </>
          )}

          {stepId === 'done' && (
            <>
              <div className={styles.onboardDoneIcon}>✓</div>
              <p style={{ fontSize: 15, lineHeight: 1.5, marginBottom: 16 }}>
                <strong>{companyName || 'Your portfolio'}</strong> is ready. Pool hours, leasing info, and call volume
                are wired into the AI assistant and Savings calculator.
              </p>
              <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={finish}>
                Go to dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
