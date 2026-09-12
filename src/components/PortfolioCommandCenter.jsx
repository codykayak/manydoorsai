import Icon from './Icon';
import { usd, pct } from '../lib/finance';
import styles from '../pm.module.css';
import cc from './commandCenter.module.css';

/**
 * Investor-facing portfolio summary strip — NOI-style KPIs at a glance.
 */
export default function PortfolioCommandCenter({ summary, openWorkOrders, propertyCount }) {
  const vacPct = summary.vacancyRate;
  const noiPerUnit = summary.cap.units
    ? summary.noiT12 / summary.cap.units
    : 0;

  const kpis = [
    {
      label: 'Portfolio NOI (T12)',
      value: usd(summary.noiT12),
      sub: `MTD ${usd(summary.noiMTD)} · margin ${pct(summary.operatingMargin)}`,
    },
    {
      label: 'Properties',
      value: propertyCount,
      sub: `${summary.cap.units} total units`,
    },
    {
      label: 'Vacancy',
      value: pct(vacPct),
      sub: `${Math.round(summary.cap.units * vacPct)} units vacant`,
    },
    {
      label: 'Maintenance backlog',
      value: openWorkOrders,
      sub: 'Open work orders',
    },
    {
      label: 'Cash-on-Cash',
      value: pct(summary.cashOnCash),
      sub: `${usd(summary.cashFlowT12)} T12 cash flow`,
    },
    {
      label: 'NOI / unit (T12)',
      value: usd(noiPerUnit),
      sub: 'Trailing twelve months',
    },
  ];

  return (
    <div className={cc.portfolioCmd}>
      <div className={cc.portfolioCmdHead}>
        <div className={cc.portfolioCmdTitle}>
          <Icon name="grid" size={18} className={cc.cyanIcon} />
          Portfolio Command Center
        </div>
        <span className={`${styles.badge} ${styles.badgeBlue}`}>
          <Icon name="spark" size={11} /> Live portfolio snapshot
        </span>
      </div>
      <div className={`${styles.grid} ${styles.cols3}`} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        {kpis.map((k) => (
          <div key={k.label} className={cc.portfolioKpi}>
            <span className={cc.portfolioKpiLabel}>{k.label}</span>
            <span className={cc.portfolioKpiValue}>{k.value}</span>
            <span className={cc.portfolioKpiSub}>{k.sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
