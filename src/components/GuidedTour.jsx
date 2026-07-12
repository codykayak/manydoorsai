import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePm } from '../context/PmContext';
import Icon from './Icon';
import styles from '../pm.module.css';

function hrefFor(base, route) {
  const b = (base || '/').replace(/\/$/, '') || '/';
  if (!route) return b === '/' ? '/' : b;
  return b === '/' ? `/${route}` : `${b}/${route}`;
}

const STEPS = [
  {
    id: 'dashboard',
    route: 'dashboard',
    title: 'Operations command center',
    body: 'Deflection, staff hours saved, leasing pipeline, and open work orders — start here as a property manager.',
    target: 'tour-dashboard',
  },
  {
    id: 'comms',
    route: 'communications',
    title: 'AI resident communication',
    body: 'Simulate a resident SMS like “What are the pool hours?” to see instant knowledge-base deflection — or a noise complaint to force human escalation.',
    target: 'tour-communications',
  },
  {
    id: 'maintenance',
    route: 'maintenance',
    title: 'Emergency triage + receipts',
    body: 'Create a request with “I smell gas.” Watch AI dispatch, then expand the work order to see SMS + PMS write-back action receipts.',
    target: 'tour-maintenance',
  },
  {
    id: 'leasing',
    route: 'leasing',
    title: 'Leasing pipeline',
    body: 'Advance a lead into Tour — a calendar hold is booked automatically and stage-change receipts appear on the card.',
    target: 'tour-leasing',
  },
  {
    id: 'owner',
    route: 'owner-home',
    title: 'Owner home',
    body: 'Flip to Owner mode anytime. Owners see cash, variance, alerts, and documents — not the staff inbox.',
    target: 'tour-role',
  },
];

export default function GuidedTour({ open, onClose, onComplete }) {
  const { config, setDemoRole } = usePm();
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const step = STEPS[idx];

  const path = useMemo(() => hrefFor(config.basePath, step.route), [config.basePath, step.route]);

  useEffect(() => {
    if (!open) return;
    navigate(path);
    if (step.id === 'owner') setDemoRole('owner');
    else setDemoRole('pm');
  }, [open, path, step.id, navigate, setDemoRole]);

  if (!open) return null;

  function next() {
    if (idx >= STEPS.length - 1) {
      setDemoRole('pm');
      navigate(hrefFor(config.basePath, 'dashboard'));
      onComplete?.();
      return;
    }
    setIdx((i) => i + 1);
  }

  function skip() {
    setDemoRole('pm');
    onClose?.();
    onComplete?.();
  }

  return (
    <div className={styles.tourRoot} role="dialog" aria-modal="true" aria-label="Guided demo tour">
      <div className={styles.tourCard}>
        <div className={styles.tourProgress}>
          Step {idx + 1} of {STEPS.length}
        </div>
        <div className={styles.cardTitle} style={{ fontSize: 16, marginBottom: 8 }}>
          <Icon name="spark" size={16} /> {step.title}
        </div>
        <p className={styles.hint} style={{ fontSize: 13.5, marginBottom: 16 }}>{step.body}</p>
        <div className={styles.rowWrap}>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={next}>
            {idx >= STEPS.length - 1 ? 'Finish tour' : 'Next →'}
          </button>
          {idx > 0 && (
            <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setIdx((i) => i - 1)}>
              Back
            </button>
          )}
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={skip}>
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
