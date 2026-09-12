import Icon from './Icon';
import { vacancyStatusBadge } from '../lib/commandCenter';
import styles from '../pm.module.css';
import cc from './commandCenter.module.css';

export default function VacancyTracker({ units }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.cardTitle}>
          <Icon name="home" size={16} className={cc.cyanIcon} />
          Vacancy tracker
        </span>
        <span className={styles.hint}>Longest vacant first</span>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Unit</th>
            <th>Property</th>
            <th>Days vacant</th>
            <th>Status</th>
            <th>Rent</th>
          </tr>
        </thead>
        <tbody>
          {units.map((u) => {
            const badge = vacancyStatusBadge(u.status);
            const badgeCls = badge.cls === 'amber' ? styles.badgeAmber
              : badge.cls === 'blue' ? styles.badgeBlue : styles.badgeGray;
            const daysCls = u.daysVacant >= 30 ? cc.daysCritical : u.daysVacant >= 14 ? cc.daysWarn : '';
            return (
              <tr key={`${u.propertyId}-${u.unit}`}>
                <td><strong>{u.unit}</strong></td>
                <td>{u.property}</td>
                <td className={daysCls}><strong>{u.daysVacant}</strong></td>
                <td><span className={`${styles.badge} ${badgeCls}`}>{badge.label}</span></td>
                <td>${u.rent.toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
