import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import Page from '../components/Page';
import { usePm } from '../context/PmContext';
import { JOB_STATUSES, PACKS, loadProsHq, resetProsHq, saveProsHq } from '../data/prosHqDemo';
import { PROS_APK_URL } from '../content/prosContent';
import styles from '../pm.module.css';
import hq from './prosHq.module.css';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'dispatch', label: 'Jobs', icon: 'doc' },
  { id: 'parts', label: 'Parts', icon: 'upload' },
  { id: 'whereabouts', label: 'Where is everybody?', icon: 'flag' },
  { id: 'notifications', label: 'Notify', icon: 'phone' },
  { id: 'knowledge', label: 'Knowledge', icon: 'book' },
  { id: 'team', label: 'Team', icon: 'users' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
  { id: 'help', label: 'Help', icon: 'alert' },
];

function hrefFor(base, route) {
  const b = (base || '/').replace(/\/$/, '');
  return route ? `${b}/${route}` : b;
}

export default function ProsHqPanel({ embedded = false }) {
  const { config } = usePm();
  const base = config.basePath;
  const [tab, setTab] = useState('overview');
  const [state, setState] = useState(() => loadProsHq());
  const [jobTitle, setJobTitle] = useState('');
  const [jobAddress, setJobAddress] = useState('');
  const [jobAssignee, setJobAssignee] = useState(state.members[2]?.name || '');
  const [jobPack, setJobPack] = useState('property');
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyBody, setNotifyBody] = useState('');

  const commit = (next) => {
    setState(next);
    saveProsHq(next);
  };

  const kpis = useMemo(() => ({
    open: state.jobs.filter((j) => j.status !== 'done').length,
    techs: state.members.filter((m) => m.role === 'tech').length,
    parts: state.parts.filter((p) => p.status !== 'ordered').length,
    tips: state.tips.length,
  }), [state]);

  const addJob = () => {
    if (!jobTitle.trim()) return;
    commit({
      ...state,
      jobs: [
        {
          id: `j${Date.now()}`,
          title: jobTitle.trim(),
          address: jobAddress.trim() || 'TBD',
          assignee: jobAssignee,
          pack: jobPack,
          status: 'queued',
          priority: 'normal',
          customer: '',
          phone: '',
          notes: '',
        },
        ...state.jobs,
      ],
    });
    setJobTitle('');
    setJobAddress('');
  };

  const setJobStatus = (id, status) => {
    commit({ ...state, jobs: state.jobs.map((j) => (j.id === id ? { ...j, status } : j)) });
  };

  const addNotify = () => {
    if (!notifyTitle.trim()) return;
    commit({
      ...state,
      notifications: [
        { id: `n${Date.now()}`, title: notifyTitle.trim(), body: notifyBody.trim(), priority: 'normal' },
        ...state.notifications,
      ],
    });
    setNotifyTitle('');
    setNotifyBody('');
  };

  const body = (
    <div className={hq.wrap}>
      <div className={hq.banner}>
        <Icon name="spark" size={16} />
        <div>
          <strong>ManyDoors AI Pros HQ</strong> — dispatch, roster, parts, and living knowledge for the field shop.
          Demo data is saved in this browser. Public marketing lives at{' '}
          <Link to={hrefFor(base, 'pros')}>/pros</Link>.
        </div>
      </div>

      <div className={hq.header}>
        <div className={hq.brandLine}>
          <div className={hq.mark}><Icon name="wrench" size={20} /></div>
          <div>
            <div className={hq.kicker}>ManyDoors AI Pros</div>
            <h2 className={hq.title}>{state.company.name}</h2>
          </div>
        </div>
        <div className={hq.actions}>
          <a className={hq.btn} href={PROS_APK_URL}>
            <Icon name="download" size={15} /> Diagnose APK
          </a>
          <button
            type="button"
            className={hq.btn}
            onClick={() => commit(resetProsHq())}
          >
            Reset demo
          </button>
        </div>
      </div>

      <div className={hq.tabs}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? hq.tabActive : hq.tab}
            onClick={() => setTab(t.id)}
          >
            <Icon name={t.icon} size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className={hq.kpis}>
            <div className={hq.kpi}><div className={hq.kpiLabel}>Open jobs</div><div className={hq.kpiValue}>{kpis.open}</div></div>
            <div className={hq.kpi}><div className={hq.kpiLabel}>Techs</div><div className={hq.kpiValue}>{kpis.techs}</div></div>
            <div className={hq.kpi}><div className={hq.kpiLabel}>Parts pending</div><div className={hq.kpiValue}>{kpis.parts}</div></div>
            <div className={hq.kpi}><div className={hq.kpiLabel}>Field tips</div><div className={hq.kpiValue}>{kpis.tips}</div></div>
          </div>
          <div className={hq.grid2}>
            <div className={hq.card}>
              <div className={styles.cardTitle}>Job pipeline</div>
              {state.jobs.map((j) => (
                <div key={j.id} className={hq.row}>
                  <div>
                    <strong>{j.title}</strong>
                    <div className={hq.muted}>{j.address} · {j.assignee}</div>
                  </div>
                  <span className={`${hq.status} ${hq[j.status] || ''}`}>{j.status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
            <div className={hq.card}>
              <div className={styles.cardTitle}>Fix of the week</div>
              <p className={hq.muted}>{state.tips[0]?.text}</p>
              <p className={hq.muted} style={{ marginTop: 10 }}>{state.tips[0]?.pack} pack · {state.tips[0]?.helpful} helpful votes</p>
            </div>
          </div>
        </>
      )}

      {tab === 'dispatch' && (
        <div className={hq.grid2}>
          <div className={hq.card}>
            <div className={styles.cardTitle}>Dispatch a job</div>
            <div className={hq.form}>
              <input className={hq.input} placeholder="Job title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
              <input className={hq.input} placeholder="Address" value={jobAddress} onChange={(e) => setJobAddress(e.target.value)} />
              <select className={hq.select} value={jobAssignee} onChange={(e) => setJobAssignee(e.target.value)}>
                {state.members.map((m) => <option key={m.id}>{m.name}</option>)}
              </select>
              <select className={hq.select} value={jobPack} onChange={(e) => setJobPack(e.target.value)}>
                {PACKS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <button type="button" className={`${hq.btn} ${hq.btnPrimary}`} onClick={addJob}>
                <Icon name="plus" size={15} /> Create job
              </button>
            </div>
          </div>
          <div className={hq.card}>
            <div className={styles.cardTitle}>Work orders</div>
            {state.jobs.map((j) => (
              <div key={j.id} className={hq.row}>
                <div>
                  <strong>{j.title}</strong>
                  <div className={hq.muted}>{j.pack} · {j.assignee}</div>
                </div>
                <select className={hq.select} style={{ width: 'auto' }} value={j.status} onChange={(e) => setJobStatus(j.id, e.target.value)}>
                  {JOB_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'parts' && (
        <div className={hq.card}>
          <div className={styles.cardTitle}>Smart parts ordering</div>
          {state.parts.map((p) => (
            <div key={p.id} className={hq.row}>
              <div>
                <strong>{p.name}</strong>
                <div className={hq.muted}>Qty {p.qty} · job {p.jobId}</div>
              </div>
              <span className={`${hq.status} ${hq[p.status] || ''}`}>{p.status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'whereabouts' && (
        <div className={hq.card}>
          <div className={styles.cardTitle}>Roster GPS (periodic check-in)</div>
          <p className={hq.muted}>Tracking {state.settings.locationTrackingEnabled ? 'on' : 'off'} · ping every {state.settings.locationPingIntervalMinutes} min. Not live stalking.</p>
          {state.locations.map((loc) => (
            <div key={loc.id} className={hq.row}>
              <div>
                <strong>{loc.name}</strong>
                <div className={hq.muted}>{loc.label}</div>
              </div>
              <span className={hq.status}>{loc.lat.toFixed(3)}, {loc.lng.toFixed(3)}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'notifications' && (
        <div className={hq.grid2}>
          <div className={hq.card}>
            <div className={styles.cardTitle}>Push to Diagnose</div>
            <div className={hq.form}>
              <input className={hq.input} placeholder="Title" value={notifyTitle} onChange={(e) => setNotifyTitle(e.target.value)} />
              <textarea className={hq.textarea} rows={4} placeholder="Message" value={notifyBody} onChange={(e) => setNotifyBody(e.target.value)} />
              <button type="button" className={`${hq.btn} ${hq.btnPrimary}`} onClick={addNotify}>Send to roster</button>
            </div>
          </div>
          <div className={hq.card}>
            <div className={styles.cardTitle}>Recent</div>
            {state.notifications.map((n) => (
              <div key={n.id} className={hq.row}>
                <div>
                  <strong>{n.title}</strong>
                  <div className={hq.muted}>{n.body}</div>
                </div>
                <span className={`${hq.status} ${hq[n.priority] || ''}`}>{n.priority}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'knowledge' && (
        <div className={hq.card}>
          <div className={styles.cardTitle}>Living knowledge base</div>
          <p className={hq.muted}>Field tips compound from Diagnose. This demo store is local until Firebase Pros APIs are pointed at ManyDoors.</p>
          {state.tips.map((tip) => (
            <div key={tip.id} className={hq.row}>
              <div>
                <strong>{tip.pack}</strong>
                <div className={hq.muted}>{tip.text}</div>
              </div>
              <span className={hq.status}>{tip.helpful} helpful</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'team' && (
        <div className={hq.card}>
          <div className={styles.cardTitle}>Roster · invite {state.company.inviteCode}</div>
          {state.members.map((m) => (
            <div key={m.id} className={hq.row}>
              <div>
                <strong>{m.name}</strong>
                <div className={hq.muted}>{m.email}</div>
              </div>
              <span className={hq.status}>{m.role} · {m.status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'settings' && (
        <div className={hq.card}>
          <div className={styles.cardTitle}>Company settings</div>
          <label className={hq.row}>
            <span>Location tracking</span>
            <input
              type="checkbox"
              checked={state.settings.locationTrackingEnabled}
              onChange={(e) => commit({ ...state, settings: { ...state.settings, locationTrackingEnabled: e.target.checked } })}
            />
          </label>
          <label className={hq.row}>
            <span>Require job photos</span>
            <input
              type="checkbox"
              checked={state.settings.requireJobPhotos}
              onChange={(e) => commit({ ...state, settings: { ...state.settings, requireJobPhotos: e.target.checked } })}
            />
          </label>
          <label className={hq.form}>
            <span className={hq.muted}>Ping interval (minutes)</span>
            <input
              className={hq.input}
              type="number"
              min="5"
              value={state.settings.locationPingIntervalMinutes}
              onChange={(e) => commit({ ...state, settings: { ...state.settings, locationPingIntervalMinutes: Number(e.target.value) || 15 } })}
            />
          </label>
        </div>
      )}

      {tab === 'help' && (
        <div className={hq.card}>
          <div className={hq.help}>
            <h3>How Pros HQ works</h3>
            <p>
              Managers dispatch from this portal. Techs run Diagnose on Android. Job notes, photos, and “that worked”
              feedback feed the living knowledge base. This ManyDoors copy uses branded HQ screens plus a local demo
              store so you can walk a shop without leaving manydoorsai.com.
            </p>
            <p style={{ marginTop: 10 }}>
              Field APK: <a href={PROS_APK_URL}>{PROS_APK_URL}</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );

  if (embedded) return body;

  return (
    <Page
      title="ManyDoors AI Pros HQ"
      subtitle="Dispatch, knowledge, parts, and roster — ManyDoors-branded field operations"
    >
      {body}
    </Page>
  );
}
