import Icon from './Icon';
import { formatRelativeTime } from '../lib/commandCenter';
import styles from '../pm.module.css';
import cc from './commandCenter.module.css';

const CHANNEL_ICON = { sms: 'chat', email: 'doc', voice: 'phone' };

export default function AfterHoursLog({ entries }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.cardTitle}>
          <Icon name="moon" size={16} className={cc.cyanIcon} />
          After-hours AI activity
        </span>
        <span className={`${styles.badge} ${styles.badgeBlue}`}>6 PM – 7 AM</span>
      </div>
      <div className={cc.logList}>
        {entries.map((e) => (
          <div key={e.id} className={cc.logRow}>
            <div className={cc.logTime}>{formatRelativeTime(e.at)}</div>
            <div className={cc.logChannel}>
              <Icon name={CHANNEL_ICON[e.channel] || 'chat'} size={14} />
              {e.channel}
            </div>
            <div className={cc.logBody}>
              <div className={cc.logResident}>{e.resident}</div>
              <div className={cc.logSummary}>{e.summary}</div>
            </div>
            <span className={`${styles.badge} ${e.outcome === 'escalated' ? styles.badgeAmber : styles.badgeGreen}`}>
              {e.outcome === 'escalated' ? 'Escalated' : 'Auto'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
