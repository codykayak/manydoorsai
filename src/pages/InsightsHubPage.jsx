import { Link, useNavigate } from 'react-router-dom';
import { usePm } from '../context/PmContext';
import Icon from '../components/Icon';
import GatewayNavbar from '../components/GatewayNavbar';
import PmSeoHead from '../components/PmSeoHead';
import GatewayFooter from '../components/GatewayFooter';
import { INSIGHT_PAGES, INSIGHTS_INDEX } from '../content/insightsPages';
import { getPmSiteUrl } from '../content/localBusiness';
import gw from './gateway.module.css';

function hrefFor(base, route) {
  const b = (base || '/').replace(/\/$/, '');
  return route ? `${b}/${route}` : b;
}

export default function InsightsHubPage() {
  const { config } = usePm();
  const navigate = useNavigate();
  const base = config.basePath;
  const enter = () => navigate(hrefFor(base, 'dashboard'));
  const path = `${base}/insights`;

  return (
    <div className={gw.gateway}>
      <PmSeoHead
        title={`${INSIGHTS_INDEX.title} | ${config.productName}`}
        description={INSIGHTS_INDEX.metaDescription}
        path={path}
        keywords="property management companies, multifamily software, Yardi, AppFolio, ManyDoors AI value adds"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: INSIGHTS_INDEX.title,
          description: INSIGHTS_INDEX.metaDescription,
          url: getPmSiteUrl(config, path),
        }}
        siteBase={getPmSiteUrl(config)}
      />
      <GatewayNavbar onEnter={enter} />
      <div className={gw.gatewayInner}>
        <header className={gw.locationHero}>
          <p className={gw.eyebrow}>Vetted operator briefing</p>
          <h1 className={gw.sectionTitle}>{INSIGHTS_INDEX.title}</h1>
          <p className={gw.sectionSub}>{INSIGHTS_INDEX.intro}</p>
        </header>

        <div className={gw.locationGrid}>
          {INSIGHT_PAGES.map((page) => (
            <Link
              key={page.slug}
              to={hrefFor(base, `insights/${page.slug}`)}
              className={gw.locationCard}
            >
              <div className={gw.locationCardRegion}>Knowledge</div>
              <div className={gw.locationCardTitle}>{page.headline}</div>
              <p className={gw.locationCardBlurb}>{page.metaDescription}</p>
              <span className={gw.moduleLink}>Read briefing →</span>
            </Link>
          ))}
        </div>

        <div className={gw.locationIndexFoot}>
          <button type="button" className={gw.enterBtn} onClick={enter}>
            Enter live demo
            <Icon name="bolt" size={20} />
          </button>
          <p className={gw.kpiSub}>
            Then see it locally:{' '}
            <Link to={hrefFor(base, 'locations')}>Oregon service areas</Link>
          </p>
        </div>
      </div>
      <GatewayFooter />
    </div>
  );
}
