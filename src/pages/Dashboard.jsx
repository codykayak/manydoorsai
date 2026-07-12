import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePm } from '../context/PmContext';
import Page from '../components/Page';
import Icon from '../components/Icon';
import HeroSection from '../components/HeroSection';
import styles from '../pm.module.css';

function hrefFor(base, route) {
  const b = (base || '/').replace(/\/$/, '') || '/';
  if (!route) return b === '/' ? '/' : b;
  return b === '/' ? `/${route}` : `${b}/${route}`;
}

export default function Dashboard() {
  const {
    conversations, leasingLeads, workOrders, tenant, config, onboardingComplete, startTour, tourComplete,
  } = usePm();

  const stats = useMemo(() => {
    const autoResolved = conversations.filter((c) => c.status === 'auto-resolved').length;
    const total = conversations.length || 1;
    const deflectionRate = Math.round((autoResolved / total) * 100);
    const openWO = workOrders.filter((w) => w.status !== 'closed').length;
    const emergencies = workOrders.filter((w) => w.priority === 'emergency' && w.status !== 'closed').length;
    const selfHelp = workOrders.filter((w) => w.status === 'self-help-sent').length;
    const inPipeline = leasingLeads.filter((l) => l.stage !== 'declined' && l.stage !== 'leased').length;
    const minutesSaved = autoResolved * 4 + inPipeline * 25 + selfHelp * 30;
    const hoursSaved = (minutesSaved / 60).toFixed(1);
    const units = (tenant?.properties || []).reduce((s, p) => s + (p.units || 0), 0);
    return { deflectionRate, autoResolved, total, openWO, emergencies, selfHelp, inPipeline, hoursSaved, units };
  }, [conversations, leasingLeads, workOrders, tenant]);

  const queues = useMemo(() => {
    const needsHuman = conversations
      .filter((c) => c.status === 'needs-human')
      .slice(0, 4)
      .map((c) => ({
        id: c.id,
        title: c.resident || 'Resident',
        sub: 'Needs human · Communications',
        href: 'communications',
        tone: 'amber',
      }));
    const emergencies = workOrders
      .filter((w) => w.priority === 'emergency' && w.status !== 'closed')
      .slice(0, 4)
      .map((w) => ({
        id: w.id,
        title: `Unit ${w.unit} · ${w.category}`,
        sub: w.issue,
        href: 'maintenance',
        tone: 'red',
      }));
    const tours = leasingLeads
      .filter((l) => l.stage === 'tour' || l.stage === 'prescreen')
      .slice(0, 4)
      .map((l) => ({
        id: l.id,
        title: l.name,
        sub: l.tourSlot ? `Tour ${l.tourSlot.label}` : `Stage: ${l.stage}`,
        href: 'leasing',
        tone: 'blue',
      }));
    return { needsHuman, emergencies, tours };
  }, [conversations, workOrders, leasingLeads]);

  const metric = (icon, label, value, sub, accent) => (
    <div className={styles.card}>
      <div className={styles.metric}>
        <span className={styles.metricLabel}><Icon name={icon} size={15} /> {label}</span>
        <span className={styles.metricValue} style={accent ? { color: 'var(--pm-accent)' } : undefined}>{value}</span>
        {sub && <span className={styles.metricSub}>{sub}</span>}
      </div>
    </div>
  );

  return (
    <>
      <HeroSection />
      <Page
        title="Operations Dashboard"
        subtitle={`${tenant?.name || 'Demo'} · ${(tenant?.properties || []).length} properties · ${stats.units} units`}
        actions={
          onboardingComplete && !tourComplete ? (
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={startTour}>
              <Icon name="spark" size={15} /> Take guided tour
            </button>
          ) : null
        }
      >
        <div className={`${styles.grid} ${styles.cols4}`} data-tour="tour-dashboard">
          {metric('chat', 'AI Deflection Rate', `${stats.deflectionRate}%`, `${stats.autoResolved} of ${stats.total} inquiries auto-resolved`, true)}
          {metric('clock', 'Staff Time Saved', `${stats.hoursSaved} hrs`, 'This period (modeled)')}
          {metric('key', 'Leasing Pipeline', stats.inPipeline, 'Active applicants being auto-screened')}
          {metric('wrench', 'Open Work Orders', stats.openWO, `${stats.emergencies} emergency · ${stats.selfHelp} self-help deflected`)}
        </div>

        <div className={styles.sectionTitle}>Action queues</div>
        <div className={`${styles.grid} ${styles.cols3}`}>
          <QueueCard
            title="Needs human"
            icon="chat"
            empty="No escalated threads"
            items={queues.needsHuman}
            base={config.basePath}
          />
          <QueueCard
            title="Emergencies"
            icon="alert"
            empty="No open emergencies"
            items={queues.emergencies}
            base={config.basePath}
          />
          <QueueCard
            title="Leasing follow-ups"
            icon="key"
            empty="No active tour / pre-screen leads"
            items={queues.tours}
            base={config.basePath}
          />
        </div>

        <div className={styles.banner} style={{ marginTop: 22 }}>
          <Icon name="spark" size={18} style={{ marginTop: 1, color: 'var(--pm-accent)' }} />
          <div>
            {onboardingComplete ? (
              <>
                <strong>{config.productName} is configured.</strong> Try Maintenance triage with an emergency phrase
                (e.g. &quot;I smell gas&quot;) to see on-call routing and action receipts. Switch to <strong>Owner</strong> in
                the sidebar for the investor home. Connect Twilio / cloud sync in <strong>Settings</strong>.
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

function QueueCard({ title, icon, items, empty, base }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}><Icon name={icon} size={14} /> {title}</div>
      {items.length === 0 && <div className={styles.hint}>{empty}</div>}
      <div className={styles.list} style={{ marginTop: 8 }}>
        {items.map((item) => (
          <Link
            key={item.id}
            to={hrefFor(base, item.href)}
            className={styles.listItem}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div>
              <div className={styles.itemTitle}>{item.title}</div>
              <div className={styles.itemSub}>{item.sub}</div>
            </div>
            <span className={`${styles.badge} ${item.tone === 'red' ? styles.badgeRed : item.tone === 'amber' ? styles.badgeAmber : styles.badgeBlue}`}>
              Open
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
