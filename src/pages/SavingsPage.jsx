import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePm } from '../context/PmContext';
import GatewayNavbar from '../components/GatewayNavbar';
import GatewayFooter from '../components/GatewayFooter';
import PageBackdrop from '../components/PageBackdrop';
import PmSeoHead from '../components/PmSeoHead';
import SavingsCalculator from '../components/SavingsCalculator';
import PortfolioRoiPanel from '../components/PortfolioRoiPanel';
import Icon from '../components/Icon';
import { FEATURE_BY_SLUG } from '../content/gatewayContent';
import gw from './gateway.module.css';

function hrefFor(base, route) {
  const b = (base || '/').replace(/\/$/, '');
  return route ? `${b}/${route}` : b;
}

const PAGE_TABS = [
  { id: 'operations', label: 'Operations savings' },
  { id: 'portfolio', label: 'Portfolio ROI' },
];

export default function SavingsPage() {
  const { config, propertyProfile } = usePm();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const base = config.basePath;
  const feature = FEATURE_BY_SLUG.savings;
  const enter = () => navigate(hrefFor(base, 'dashboard'));
  const tab = searchParams.get('view') === 'portfolio' ? 'portfolio' : 'operations';

  const setTab = (id) => {
    if (id === 'portfolio') {
      setSearchParams({ view: 'portfolio' });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className={gw.gateway}>
      <PageBackdrop page="savings" />
      <PmSeoHead
        title={`Savings & ROI | ${config.productName}`}
        description={feature?.metaDescription || 'Estimate monthly savings and portfolio ROI from AI-assisted leasing, maintenance, and resident communications.'}
        path={`${base}/features/savings`}
        keywords={`${config.productName}, multifamily savings calculator, property management ROI, ${config.futureSite}`}
      />
      <GatewayNavbar onEnter={enter} />

      <div className={gw.gatewayInner}>
        <article className={gw.featureArticle}>
          <header className={gw.featureHero}>
            <p className={gw.eyebrow}>
              <Icon name="dollar" size={14} />
              {' '}
              Savings &amp; ROI
            </p>
            <h1 className={gw.heroTitle}>{feature?.title || 'Savings & ROI'}</h1>
            <p className={gw.heroLead}>
              Model day-to-day operations savings or full-portfolio ROI — defaults pre-fill from your onboarding profile when available.
            </p>
          </header>

          <div className={gw.overviewTabs} role="tablist" aria-label="Savings calculators">
            {PAGE_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`${gw.overviewTab} ${tab === t.id ? gw.overviewTabActive : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'operations' ? (
            <div role="tabpanel">
              <SavingsCalculator initialProfile={propertyProfile} />
              {feature?.sections?.map((s) => (
                <section key={s.heading} style={{ marginTop: 32 }}>
                  <h2 className={gw.sectionTitle}>{s.heading}</h2>
                  <p className={gw.sectionSub}>{s.body}</p>
                </section>
              ))}
            </div>
          ) : (
            <div role="tabpanel">
              <p className={gw.sectionSub} style={{ marginBottom: 20 }}>
                Estimate annual impact from resident deflection, maintenance triage, faster lease-up, and fraud prevention across your portfolio.
              </p>
              <PortfolioRoiPanel />
            </div>
          )}

          <footer className={gw.footerCta} style={{ marginTop: 40 }}>
            <button type="button" className={gw.enterBtn} onClick={enter}>
              Enter {config.productName}
              <Icon name="bolt" size={22} />
            </button>
          </footer>
        </article>
      </div>

      <GatewayFooter />
    </div>
  );
}
