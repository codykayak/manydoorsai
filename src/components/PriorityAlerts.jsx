import { Link } from 'react-router-dom';
import Icon from './Icon';
import styles from '../pm.module.css';
import cc from './commandCenter.module.css';

const SEV_CLASS = {
  red: cc.alertRed,
  amber: cc.alertAmber,
  blue: cc.alertBlue,
};

export default function PriorityAlerts({ alerts, basePath }) {
  if (!alerts?.length) return null;

  const href = (route) => {
    const b = (basePath || '/property-management').replace(/\/$/, '');
    return route ? `${b}/${route}` : b;
  };

  return (
    <div className={cc.alertBox}>
      <div className={cc.alertBoxHead}>
        <Icon name="alert" size={18} className={cc.cyanIcon} />
        <div>
          <div className={cc.alertBoxTitle}>High-priority — needs action today</div>
          <div className={styles.hint}>Counts refresh from live leasing & maintenance data</div>
        </div>
      </div>
      <div className={cc.alertChips}>
        {alerts.map((a) => (
          <Link
            key={a.key}
            to={href(a.href)}
            className={`${cc.alertChip} ${SEV_CLASS[a.severity] || cc.alertAmber}`}
          >
            <span className={cc.alertCount}>{a.count}</span>
            <span className={cc.alertLabel}>
              <Icon name={a.icon} size={14} />
              {a.label}
            </span>
            {a.wired && <span className={cc.wiredDot} title="Live data" />}
          </Link>
        ))}
      </div>
    </div>
  );
}
