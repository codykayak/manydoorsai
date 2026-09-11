import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePm } from '../context/PmContext';
import Page from '../components/Page';
import Icon from '../components/Icon';
import HeroSection from '../components/HeroSection';
import PriorityAlerts from '../components/PriorityAlerts';
import AfterHoursLog from '../components/AfterHoursLog';
import VacancyTracker from '../components/VacancyTracker';
import DocumentInboxDropzone from '../components/DocumentInboxDropzone';
import {
  buildPriorityAlerts, buildAfterHoursLog, sortVacantUnits,
} from '../lib/commandCenter';
import styles from '../pm.module.css';
import cc from '../components/commandCenter.module.css';

export default function Dashboard() {
  const {
    conversations, leasingLeads, workOrders, tenant, config, onboardingComplete, featureMap,
  } = usePm();

  const stats = useMemo(() => {
    const autoResolved = conversations.filter((c) => c.status === 'auto-resolved').length;
    const total = conversations.length || 1;
    const deflectionRate = Math.round((autoResolved / total) * 100);
    const openWO = workOrders.filter((w) => w.status !== 'closed').length;
    const inPipeline = leasingLeads.filter((l) => l.stage !== 'declined' && l.stage !== 'leased').length;
    const units = (tenant?.properties || []).reduce((s, p) => s + (p.units || 0), 0);
    return { deflectionRate, autoResolved, total, openWO, inPipeline, units };
  }, [conversations, leasingLeads, workOrders, tenant]);

  const alerts = useMemo(
    () => buildPriorityAlerts({
      leasingLeads,
      workOrders,
      leasingConfig: featureMap.leasing?.config || {},
    }),
    [leasingLeads, workOrders, featureMap],
  );

  const afterHours = useMemo(() => buildAfterHoursLog(conversations), [conversations]);
  const vacantUnits = useMemo(() => sortVacantUnits(), []);

  const base = config.basePath || '/property-management';

  const metric = (icon, label, value, sub, accent) => (
    <div className={styles.card}>
      <div className={styles.metric}>
        <span className={styles.metricLabel}><Icon name={icon} size={15} /> {label}</span>
        <span className={styles.metricValue} style={accent ? { color: '#00d2d3' } : undefined}>{value}</span>
        {sub && <span className={styles.metricSub}>{sub}</span>}
      </div>
    </div>
  );

  return (
    <>
      <HeroSection />
      <Page
        title="Quick View Command Center"
        subtitle={`${tenant?.name || 'Demo'} · ${(tenant?.properties || []).length} properties · ${stats.units} units`}
        actions={(
          <Link to={`${base.replace(/\/$/, '')}/compliance`} className={`${styles.btn} ${styles.btnGhost}`}>
            <Icon name="shield" size={15} /> Compliance log
          </Link>
        )}
      >
        <PriorityAlerts alerts={alerts} basePath={base} />

        <div className={`${styles.grid} ${styles.cols4}`} style={{ marginTop: 18 }}>
          {metric('chat', 'AI Deflection', `${stats.deflectionRate}%`, `${stats.autoResolved}/${stats.total} auto-resolved`, true)}
          {metric('key', 'Leasing Pipeline', stats.inPipeline, 'Active applicants', true)}
          {metric('wrench', 'Open Work Orders', stats.openWO, 'Across portfolio')}
          {metric('home', 'Vacant Units', vacantUnits.length, 'Tracked in vacancy table')}
        </div>

        <div className={`${styles.grid} ${styles.cols2}`} style={{ marginTop: 16 }}>
          <AfterHoursLog entries={afterHours} />
          <VacancyTracker units={vacantUnits} />
        </div>

        <div className={styles.sectionTitle}>Document inbox</div>
        <DocumentInboxDropzone />

        <div className={styles.sectionTitle}>Where the value comes from</div>
        <div className={`${styles.grid} ${styles.cols3}`}>
          <ValueCard
            icon="chat"
            title="Inquiry deflection"
            body="Repetitive resident questions are answered instantly from your knowledge base, 24/7 — reclaiming staff hours and covering nights and weekends."
          />
          <ValueCard
            icon="key"
            title="Faster, safer leasing"
            body="Instant lead response plus automated pre-screening cuts vacancy days and keeps bad applications from reaching a human."
          />
          <ValueCard
            icon="wrench"
            title="Maintenance fast-track"
            body="AI triages every request, flags emergencies for your on-call tech, and deflects fixable issues with guided self-help."
          />
        </div>

        <div className={styles.banner} style={{ marginTop: 22 }}>
          <Icon name="spark" size={18} style={{ marginTop: 1, color: '#00d2d3' }} />
          <div>
            {onboardingComplete ? (
              <>
                <strong>{config.productName} is configured.</strong> High-priority alerts pull from live leasing
                and maintenance data. Try Maintenance triage with an emergency phrase to see on-call routing.
              </>
            ) : (
              <>
                <strong>Welcome to {config.productName}.</strong> Use the <strong>Onboarding</strong> button at the top
                to load your company data, phone number, spreadsheets, and on-call maintenance techs.
              </>
            )}
          </div>
        </div>
      </Page>
    </>
  );
}

function ValueCard({ icon, title, body }) {
  return (
    <div className={styles.card}>
      <div className={styles.metricLabel} style={{ marginBottom: 8 }}>
        <Icon name={icon} size={16} /> <strong style={{ color: 'var(--pm-text)', fontSize: 14 }}>{title}</strong>
      </div>
      <div className={styles.hint}>{body}</div>
    </div>
  );
}
