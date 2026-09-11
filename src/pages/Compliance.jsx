import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePm } from '../context/PmContext';
import Page from '../components/Page';
import Icon from '../components/Icon';
import {
  listAuditEntries, AUDIT_CATEGORY_META, formatAuditTimestamp, severityStyle,
} from '../lib/complianceAudit';
import styles from '../pm.module.css';
import cc from '../components/commandCenter.module.css';

const SEV_BADGE = {
  blue: styles.badgeBlue,
  amber: styles.badgeAmber,
  red: styles.badgeRed,
  gray: styles.badgeGray,
};

export default function Compliance() {
  const { config } = usePm();
  const [filter, setFilter] = useState('all');
  const base = (config.basePath || '/property-management').replace(/\/$/, '');

  const entries = useMemo(
    () => listAuditEntries(undefined, { category: filter === 'all' ? null : filter }),
    [filter],
  );

  const counts = useMemo(() => {
    const all = listAuditEntries();
    const byCat = {};
    for (const e of all) byCat[e.category] = (byCat[e.category] || 0) + 1;
    return byCat;
  }, []);

  return (
    <Page
      title="Compliance & Audit Trail"
      subtitle="Fair housing guardrails, maintenance SLAs, and escalation logs"
      actions={(
        <Link to={`${base}/dashboard`} className={`${styles.btn} ${styles.btnGhost}`}>
          <Icon name="grid" size={15} /> Command center
        </Link>
      )}
    >
      <div className={cc.complianceIntro}>
        <Icon name="shield" size={20} className={cc.cyanIcon} />
        <div>
          Every AI decision that touches residents is logged. Sensitive topics are never auto-answered.
          SLA breaches and escalations create immutable audit entries for owner and regulator review.
        </div>
      </div>

      <div className={cc.filterRow}>
        <button
          className={`${styles.btn} ${styles.btnSm} ${filter === 'all' ? cc.filterActive : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({listAuditEntries().length})
        </button>
        {Object.entries(AUDIT_CATEGORY_META).map(([key, meta]) => (
          <button
            key={key}
            className={`${styles.btn} ${styles.btnSm} ${filter === key ? cc.filterActive : ''}`}
            onClick={() => setFilter(key)}
          >
            <Icon name={meta.icon} size={13} />
            {meta.label} ({counts[key] || 0})
          </button>
        ))}
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Category</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Detail</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => {
              const meta = AUDIT_CATEGORY_META[e.category];
              const sev = severityStyle(e.severity);
              return (
                <tr key={e.id}>
                  <td className={cc.auditTime}>{formatAuditTimestamp(e.at)}</td>
                  <td>
                    <span className={`${styles.badge} ${styles.badgeGray}`}>
                      <Icon name={meta?.icon || 'doc'} size={11} />
                      {meta?.label || e.category}
                    </span>
                  </td>
                  <td>
                    <div className={cc.auditActor}>{e.actorName}</div>
                    <div className={styles.hint}>{e.actor}</div>
                  </td>
                  <td><strong>{e.action}</strong></td>
                  <td className={cc.auditDetail}>
                    {e.detail}
                    {e.residentRef && <div className={styles.hint}>{e.residentRef}</div>}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${SEV_BADGE[sev] || styles.badgeGray}`}>
                      {e.severity}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.banner} style={{ marginTop: 20 }}>
        <Icon name="doc" size={16} className={cc.cyanIcon} />
        <div>
          <strong>Export & retention.</strong> Audit logs are retained 7 years (TCPA / fair housing).
          Full SIEM export and owner-facing compliance PDFs ship in a future release.
        </div>
      </div>
    </Page>
  );
}
