import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePm } from '../context/PmContext';
import Icon from '../components/Icon';
import PmSeoHead from '../components/PmSeoHead';
import {
  CALL_OUTCOMES,
  LEAD_STATUSES,
  LEEDS_LISTS,
  formatPhoneDisplay,
} from '../data/leedsProspects.js';
import {
  addCall,
  downloadLeedsCsv,
  emptyLeadState,
  loadLeedsTracker,
  mergeLead,
  saveLeedsTracker,
} from '../lib/leedsTracker.js';
import css from './leeds.module.css';

const STATUS_TONE = {
  gray: css.toneGray,
  amber: css.toneAmber,
  blue: css.toneBlue,
  green: css.toneGreen,
  red: css.toneRed,
};

function statusMeta(id) {
  return LEAD_STATUSES.find((s) => s.id === id) || LEAD_STATUSES[0];
}

function formatWhen(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function LeedsPage() {
  const { config } = usePm();
  const location = useLocation();
  const listId = /\/leeds\/eugene\/?$/.test(location.pathname) ? 'eugene' : 'pnw';
  const list = LEEDS_LISTS[listId];
  const prospects = list.prospects;

  const [tracker, setTracker] = useState(() => loadLeedsTracker());
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openId, setOpenId] = useState(prospects[0]?.id || null);
  const [pendingDial, setPendingDial] = useState(null);

  useEffect(() => {
    setQuery('');
    setStatusFilter('all');
    setOpenId(prospects[0]?.id || null);
    setPendingDial(null);
  }, [listId, prospects]);

  useEffect(() => {
    saveLeedsTracker(tracker);
  }, [tracker]);

  const updateLead = useCallback((id, patch) => {
    setTracker((prev) => mergeLead(prev, id, patch));
  }, []);

  const logCall = useCallback((id, call) => {
    setTracker((prev) => addCall(prev, id, call));
  }, []);

  const startCall = useCallback((prospect, which = 'primary') => {
    const phone = which === 'alt' ? prospect.altPhone : prospect.phone;
    const e164 = which === 'alt' ? prospect.altPhoneE164 : prospect.phoneE164;
    const label = which === 'alt' ? prospect.altLabel : prospect.phoneLabel;
    if (!e164) return;
    logCall(prospect.id, { phone, phoneLabel: label, outcome: 'dialed' });
    setOpenId(prospect.id);
    setPendingDial({ id: prospect.id, phone, label });
  }, [logCall]);

  const setOutcome = useCallback((id, outcome) => {
    setTracker((prev) => {
      const state = prev[id] || emptyLeadState();
      const calls = [...(state.calls || [])];
      if (calls[0]) {
        calls[0] = { ...calls[0], outcome };
      }
      let status = state.status;
      if (outcome === 'meeting') status = 'meeting';
      else if (outcome === 'connected' || outcome === 'callback') status = 'in_conversation';
      else if (outcome === 'not_fit') status = 'closed_out';
      else if (status === 'not_contacted') status = 'attempted';
      return mergeLead(prev, id, { calls, status });
    });
    setPendingDial((cur) => (cur?.id === id ? null : cur));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return prospects.filter((p) => {
      const t = tracker[p.id] || emptyLeadState();
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (!q) return true;
      const hay = [
        p.name, p.market, p.hq, p.askFor, p.phone, p.altPhone, p.email, p.howToReach, t.notes,
      ].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [query, statusFilter, tracker, prospects]);

  const stats = useMemo(() => {
    const counts = { not_contacted: 0, attempted: 0, in_conversation: 0, meeting: 0 };
    let calls = 0;
    prospects.forEach((p) => {
      const t = tracker[p.id] || emptyLeadState();
      if (counts[t.status] != null) counts[t.status] += 1;
      else if (t.status === 'nurture') counts.in_conversation += 1;
      calls += (t.calls || []).length;
    });
    return { ...counts, calls, total: prospects.length };
  }, [tracker, prospects]);

  const open = prospects.find((p) => p.id === openId) || filtered[0] || prospects[0];
  const openState = (open && tracker[open.id]) || emptyLeadState();

  return (
    <div className={css.page}>
      <PmSeoHead
        title={`${list.title} | ${config.productName} (internal)`}
        description="Internal property-manager outreach list. Not for public indexing."
        path={`/${list.path}`}
        robots="noindex, nofollow, noarchive"
        siteBase={config.siteUrl}
      />

      <header className={css.top}>
        <div className={css.topInner}>
          <Link to="/" className={css.brand} aria-label={`${config.productName} home`}>
            <img
              src={config.logoMenu || config.logoWordmark || config.logo}
              alt=""
              className={css.logo}
            />
          </Link>
          <div className={css.topCopy}>
            <div className={css.kicker}>{list.kicker}</div>
            <h1 className={css.title}>{list.title}</h1>
            <p className={css.sub}>{list.sub}</p>
            <nav className={css.listTabs} aria-label="Lead lists">
              {Object.values(LEEDS_LISTS).map((item) => (
                <Link
                  key={item.id}
                  to={`/${item.path}`}
                  className={`${css.listTab} ${item.id === listId ? css.listTabActive : ''}`}
                >
                  {item.tabLabel}
                </Link>
              ))}
            </nav>
          </div>
          <button
            type="button"
            className={css.csvBtn}
            onClick={() => downloadLeedsCsv(tracker, prospects, list.csvName)}
          >
            <Icon name="download" size={16} />
            Download CSV
          </button>
        </div>
      </header>

      <div className={css.body}>
        <div className={css.metrics}>
          <div className={css.metric}>
            <span>{stats.total}</span>
            companies
          </div>
          <div className={css.metric}>
            <span>{stats.not_contacted}</span>
            not contacted
          </div>
          <div className={css.metric}>
            <span>{stats.attempted}</span>
            attempted
          </div>
          <div className={css.metric}>
            <span>{stats.in_conversation}</span>
            in conversation
          </div>
          <div className={css.metric}>
            <span>{stats.meeting}</span>
            meetings
          </div>
          <div className={css.metric}>
            <span>{stats.calls}</span>
            logged calls
          </div>
        </div>

        <div className={css.toolbar}>
          <label className={css.search}>
            <Icon name="search" size={16} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search company, city, phone, notes…"
              aria-label={`Search ${list.title}`}
            />
          </label>
          <select
            className={css.filter}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by call status"
          >
            <option value="all">All statuses</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className={css.layout}>
          <ul className={css.list} aria-label="Prospect companies">
            {filtered.map((p) => {
              const t = tracker[p.id] || emptyLeadState();
              const st = statusMeta(t.status);
              const active = open?.id === p.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    className={`${css.row} ${active ? css.rowActive : ''}`}
                    onClick={() => setOpenId(p.id)}
                  >
                    <div className={css.rowMain}>
                      <div className={css.rowName}>{p.name}</div>
                      <div className={css.rowMeta}>
                        {p.market} · {p.unitsLabel}
                      </div>
                    </div>
                    <span className={`${css.pill} ${STATUS_TONE[st.tone]}`}>{st.label}</span>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className={css.empty}>No companies match that filter.</li>
            )}
          </ul>

          {open && (
            <section className={css.detail} aria-labelledby="leeds-detail-title">
              <div className={css.detailHead}>
                <div>
                  <h2 id="leeds-detail-title" className={css.detailName}>{open.name}</h2>
                  <p className={css.detailMeta}>
                    {open.hq} · {open.market} · {open.unitsLabel}
                  </p>
                </div>
                <select
                  className={css.statusSelect}
                  value={openState.status}
                  onChange={(e) => updateLead(open.id, { status: e.target.value })}
                  aria-label="Lead status"
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              <p className={css.ask}>
                <strong>Ask for:</strong> {open.askFor}
              </p>
              <p className={css.how}>{open.howToReach}</p>

              <div className={css.callRow}>
                <a
                  className={css.callBtn}
                  href={`tel:${open.phoneE164}`}
                  onClick={() => startCall(open, 'primary')}
                >
                  <Icon name="phone" size={18} />
                  Call {formatPhoneDisplay(open.phone)}
                  <span>{open.phoneLabel}</span>
                </a>
                {open.altPhoneE164 && (
                  <a
                    className={css.callBtnAlt}
                    href={`tel:${open.altPhoneE164}`}
                    onClick={() => startCall(open, 'alt')}
                  >
                    <Icon name="phone" size={16} />
                    {formatPhoneDisplay(open.altPhone)}
                    <span>{open.altLabel}</span>
                  </a>
                )}
                {open.website && (
                  <a className={css.linkBtn} href={open.website} target="_blank" rel="noreferrer">
                    Website
                  </a>
                )}
                {open.email && (
                  <a className={css.linkBtn} href={`mailto:${open.email}`}>
                    {open.email}
                  </a>
                )}
              </div>

              {(pendingDial?.id === open.id || (openState.calls[0] && openState.calls[0].outcome === 'dialed')) && (
                <div className={css.outcomeBar}>
                  <span>Log this call</span>
                  <div className={css.outcomes}>
                    {CALL_OUTCOMES.filter((o) => o.id !== 'dialed').map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        className={css.outcomeBtn}
                        onClick={() => setOutcome(open.id, o.id)}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <label className={css.notesLabel} htmlFor={`notes-${open.id}`}>
                Quick notes
              </label>
              <textarea
                id={`notes-${open.id}`}
                className={css.notes}
                value={openState.notes}
                onChange={(e) => updateLead(open.id, { notes: e.target.value })}
                placeholder="Who you reached, what they use today, next step…"
                rows={5}
              />

              <div className={css.logHead}>
                <Icon name="clock" size={14} />
                Call log
                <span>{openState.calls.length}</span>
              </div>
              {openState.calls.length === 0 ? (
                <p className={css.logEmpty}>No calls yet. Tap Call to dial and start a log entry.</p>
              ) : (
                <ol className={css.log}>
                  {openState.calls.map((c) => {
                    const outcome = CALL_OUTCOMES.find((o) => o.id === c.outcome);
                    return (
                      <li key={c.id} className={css.logItem}>
                        <div>
                          <strong>{outcome?.label || c.outcome}</strong>
                          <span>
                            {formatWhen(c.at)}
                            {c.phone ? ` · ${c.phone}` : ''}
                            {c.phoneLabel ? ` (${c.phoneLabel})` : ''}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
          )}
        </div>

        <p className={css.disclaimer}>
          Phones are public office / corporate listings, not private cell numbers. Unit counts are
          published figures or estimates from company sites and industry directories (2026). Notes and
          call history stay in this browser only. This page is noindex and is not linked from the
          marketing site.
        </p>
      </div>
    </div>
  );
}
