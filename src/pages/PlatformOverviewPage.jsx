import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePm } from '../context/PmContext';
import Icon from '../components/Icon';
import GatewayNavbar from '../components/GatewayNavbar';
import GatewayFooter from '../components/GatewayFooter';
import PageBackdrop from '../components/PageBackdrop';
import PmSeoHead from '../components/PmSeoHead';
import { FEATURE_PAGES, US_SUPPORT } from '../content/gatewayContent';
import { requestDemo } from '../lib/contactCta';
import gw from './gateway.module.css';

function hrefFor(base, route) {
  const b = (base || '/').replace(/\/$/, '');
  return route ? `${b}/${route}` : b;
}

const OVERVIEW_TABS = FEATURE_PAGES.map((f) => ({
  id: f.slug,
  label: f.navLabel || f.title.split(' ').slice(0, 2).join(' '),
  feature: f,
}));

export default function PlatformOverviewPage() {
  const { config } = usePm();
  const navigate = useNavigate();
  const base = config.basePath;
  const [tab, setTab] = useState(OVERVIEW_TABS[0]?.id || 'communications');
  const active = OVERVIEW_TABS.find((t) => t.id === tab)?.feature;

  const enter = () => navigate(hrefFor(base, 'dashboard'));
  const bookDemo = () => requestDemo(config.bookingUrl);

  return (
    <div className={gw.gateway}>
      <PageBackdrop page="overview" />
      <PmSeoHead
        title={`Platform overview | ${config.productName}`}
        description={`Explore ${config.productName} modules — resident AI, leasing, maintenance triage, owner reporting, and savings.`}
        path={hrefFor(base, 'overview')}
      />
      <GatewayNavbar onEnter={enter} />

      <div className={gw.gatewayInner}>
        <header className={gw.featureHero}>
          <p className={gw.eyebrow}>Platform overview</p>
          <h1 className={gw.heroTitle}>Everything {config.productName} does for your portfolio</h1>
          <p className={gw.heroLead}>
            Pick a module below to see how we save time, protect NOI, and keep residents happy — then enter the live demo or book a walkthrough.
          </p>
        </header>

        <div className={gw.overviewTabs} role="tablist" aria-label="Product modules">
          {OVERVIEW_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`${gw.overviewTab} ${tab === t.id ? gw.overviewTabActive : ''}`}
              onClick={() => setTab(t.id)}
            >
              <Icon name={t.feature.icon} size={16} />
              {t.label}
            </button>
          ))}
        </div>

        {active && (
          <article className={gw.overviewPanel} role="tabpanel">
            <div className={gw.overviewPanelHead}>
              <h2 className={gw.sectionTitle}>{active.title}</h2>
              <p className={gw.sectionSub}>{active.tagline}</p>
            </div>

            <div className={gw.savingsGrid}>
              <div className={gw.savingsCard}>
                <div className={gw.savingsLabel}>Time saved</div>
                <div className={gw.savingsValue}>{active.savings.time}</div>
              </div>
              <div className={gw.savingsCard}>
                <div className={gw.savingsLabel}>Money impact</div>
                <div className={gw.savingsValue}>{active.savings.money}</div>
              </div>
              <div className={`${gw.savingsCard} ${gw.savingsCardAccent}`}>
                <div className={gw.savingsLabel}>{US_SUPPORT.headline}</div>
                <p className={gw.sectionSub} style={{ margin: 0 }}>{US_SUPPORT.body}</p>
              </div>
            </div>

            {active.sections.map((s) => (
              <section key={s.heading}>
                <h3 className={gw.sectionTitle}>{s.heading}</h3>
                <p className={gw.sectionSub}>{s.body}</p>
              </section>
            ))}

            <div className={gw.metricRow}>
              {active.metrics.map((m) => (
                <div key={m.label} className={gw.metricPill}>
                  <div className={gw.metricPillValue}>{m.value}</div>
                  <div className={gw.metricPillLabel}>{m.label}</div>
                  <div className={gw.kpiSub}>{m.sub}</div>
                </div>
              ))}
            </div>

            <div className={gw.ctaRow}>
              <Link to={hrefFor(base, `features/${active.slug}`)} className={gw.enterBtnGhost}>
                Full feature page
              </Link>
              <button type="button" className={gw.bookBtn} onClick={bookDemo}>
                Book a demo
                <Icon name="calendar" size={18} />
              </button>
              <button type="button" className={gw.enterBtn} onClick={enter}>
                Enter live demo
                <Icon name="bolt" size={18} />
              </button>
            </div>
          </article>
        )}
      </div>

      <GatewayFooter />
    </div>
  );
}
