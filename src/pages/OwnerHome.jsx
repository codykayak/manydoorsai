import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePm } from '../context/PmContext';
import Page from '../components/Page';
import Icon from '../components/Icon';
import { PROPERTIES, monthLabel } from '../data/financials';
import { summarize, usd, pct } from '../lib/finance';
import styles from '../pm.module.css';

const GREEN = '#3fb950';
const RED = '#f85149';

const DOC_STUBS = [
  { id: 'd1', name: 'Q2 2026 Owner Statement — Maple Grove', type: 'PDF', updated: 'Jul 1, 2026' },
  { id: 'd2', name: 'June distribution remittance advice', type: 'PDF', updated: 'Jul 3, 2026' },
  { id: 'd3', name: 'Insurance COI — Riverbend Commons', type: 'PDF', updated: 'Jun 12, 2026' },
  { id: 'd4', name: 'CapEx invoice pack — corridor flooring', type: 'ZIP', updated: 'May 28, 2026' },
];

function hrefFor(base, route) {
  const b = (base || '/').replace(/\/$/, '') || '/';
  if (!route) return b === '/' ? '/' : b;
  return b === '/' ? `/${route}` : `${b}/${route}`;
}

export default function OwnerHome() {
  const {
    config, tenant, conversations, workOrders, leasingLeads, settings,
  } = usePm();

  const summary = useMemo(() => summarize(null), []);
  const latest = summary.latestMonth;
  const varianceAmt = summary.noiYTD - summary.budgetYTD;
  const variancePct = summary.noiYTDvsBudgetPct;

  const distribution = useMemo(() => {
    // Illustrative monthly distribution ≈ trailing cash flow / 12
    const monthly = Math.round(summary.cashFlowT12 / 12);
    return {
      monthly,
      ytd: monthly * (new Date().getMonth() + 1),
      nextDate: 'Jul 15, 2026',
    };
  }, [summary.cashFlowT12]);

  const alerts = useMemo(() => {
    const items = [];
    const emergencies = workOrders.filter((w) => w.priority === 'emergency' && w.status !== 'closed');
    emergencies.forEach((w) => {
      items.push({
        id: `wo-${w.id}`,
        tone: 'red',
        title: `Emergency work order · Unit ${w.unit}`,
        body: w.issue,
      });
    });
    const needsHuman = conversations.filter((c) => c.status === 'needs-human');
    if (needsHuman.length) {
      items.push({
        id: 'comms',
        tone: 'amber',
        title: `${needsHuman.length} resident thread${needsHuman.length > 1 ? 's' : ''} need staff`,
        body: 'Sensitive or low-confidence inquiries escalated from AI auto-pilot.',
      });
    }
    const pipeline = leasingLeads.filter((l) => l.stage !== 'leased' && l.stage !== 'declined');
    if (pipeline.length >= 3) {
      items.push({
        id: 'lease',
        tone: 'blue',
        title: `${pipeline.length} active leasing leads`,
        body: 'Pre-screen and tour pipeline moving — vacancy days at risk if tours slip.',
      });
    }
    if (varianceAmt < 0) {
      items.push({
        id: 'var',
        tone: 'amber',
        title: `NOI YTD ${pct(Math.abs(variancePct))} below budget`,
        body: 'See variance notes below — utilities and turnover are the primary drivers this quarter.',
      });
    }
    if (!items.length) {
      items.push({
        id: 'ok',
        tone: 'green',
        title: 'No critical alerts',
        body: 'Portfolio operating within expected bands. AI deflection is covering after-hours inquiries.',
      });
    }
    return items.slice(0, 5);
  }, [workOrders, conversations, leasingLeads, varianceAmt, variancePct]);

  const propertyNames = (tenant?.properties || PROPERTIES).map((p) => p.name).join(' · ');

  return (
    <Page
      title="Owner Home"
      subtitle={`${tenant?.name || config.companyName} · cash, variance, alerts & documents`}
      actions={
        <Link className={`${styles.btn} ${styles.btnPrimary}`} to={hrefFor(config.basePath, 'owner')}>
          <Icon name="chart" size={15} /> Full portfolio analytics
        </Link>
      }
    >
      <div className={`${styles.grid} ${styles.cols4}`}>
        <Kpi label="Cash distribution (est. MTD)" value={usd(distribution.monthly)} sub={`Next remittance ${distribution.nextDate}`} accent />
        <Kpi label="Distributions YTD" value={usd(distribution.ytd)} sub={`${usd(summary.cashFlowT12)} trailing-12 cash flow`} />
        <Kpi label="NOI vs budget (YTD)" value={`${varianceAmt >= 0 ? '+' : ''}${usd(varianceAmt)}`} sub={<span style={{ color: variancePct >= 0 ? GREEN : RED }}>{pct(Math.abs(variancePct))} {variancePct >= 0 ? 'ahead' : 'behind'}</span>} />
        <Kpi label="Cash-on-Cash (T12)" value={pct(summary.cashOnCash)} sub={`${summary.cap.units} units · ${monthLabel(latest)}`} />
      </div>

      <div className={styles.sectionTitle}>Variance commentary</div>
      <div className={styles.card}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>
          <strong>{monthLabel(latest)} YTD NOI</strong> is{' '}
          <span style={{ color: variancePct >= 0 ? GREEN : RED }}>
            {variancePct >= 0 ? 'ahead of' : 'behind'} budget by {pct(Math.abs(variancePct))}
          </span>
          {' '}({usd(Math.abs(varianceAmt))}). Primary drivers this period: elevated utilities at Maple Grove
          after an HVAC shoulder-season spike, and turnover costs from three unexpected move-outs at Riverbend.
          Leasing AI pre-screen is holding bad debt flat; maintenance self-help deflection is offsetting roughly
          one truck roll per week.
        </p>
        <p className={styles.hint} style={{ marginTop: 10 }}>
          Properties in view: {propertyNames || 'Portfolio'}. Switch to <strong>Full portfolio analytics</strong> for charts and CapEx planning.
        </p>
      </div>

      <div className={styles.sectionTitle}>Alerts</div>
      <div className={styles.list}>
        {alerts.map((a) => (
          <div key={a.id} className={styles.listItem} style={{ cursor: 'default' }}>
            <div>
              <div className={styles.itemTitle}>
                <span className={`${styles.badge} ${toneBadge(a.tone, styles)}`} style={{ marginRight: 8 }}>{a.tone}</span>
                {a.title}
              </div>
              <div className={styles.itemSub}>{a.body}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.sectionTitle}>Documents</div>
      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr><th>Document</th><th>Type</th><th>Updated</th><th></th></tr>
          </thead>
          <tbody>
            {DOC_STUBS.map((d) => (
              <tr key={d.id}>
                <td><strong>{d.name}</strong></td>
                <td>{d.type}</td>
                <td>{d.updated}</td>
                <td>
                  <button type="button" className={`${styles.btn} ${styles.btnSm} ${styles.btnGhost}`} disabled title="Stub — connect document vault in production">
                    <Icon name="download" size={13} /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className={styles.hint} style={{ marginTop: 10 }}>
          Document vault is a stub in this demo. Production stores statements, insurance, CapEx invoices, and tax packets per owner with role-scoped access.
          {settings?.companyProfile?.email ? ` Notices would go to ${settings.companyProfile.email}.` : ''}
        </p>
      </div>
    </Page>
  );
}

function toneBadge(tone, styles) {
  if (tone === 'red') return styles.badgeRed;
  if (tone === 'amber') return styles.badgeAmber;
  if (tone === 'green') return styles.badgeGreen;
  return styles.badgeBlue;
}

function Kpi({ label, value, sub, accent }) {
  return (
    <div className={styles.card}>
      <div className={styles.metric}>
        <span className={styles.metricLabel}>{label}</span>
        <span className={styles.metricValue} style={accent ? { color: 'var(--pm-accent)' } : undefined}>{value}</span>
        <span className={styles.metricSub}>{sub}</span>
      </div>
    </div>
  );
}
