import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePm } from '../context/PmContext';
import Icon from '../components/Icon';
import GatewayNavbar from '../components/GatewayNavbar';
import PmSeoHead from '../components/PmSeoHead';
import GatewayFooter from '../components/GatewayFooter';
import { getInsightBySlug } from '../content/insightsPages';
import { getPmSiteUrl } from '../content/localBusiness';
import gw from './gateway.module.css';

function hrefFor(base, route) {
  const b = (base || '/').replace(/\/$/, '');
  return route ? `${b}/${route}` : b;
}

export default function InsightPage() {
  const { insightSlug } = useParams();
  const { config } = usePm();
  const navigate = useNavigate();
  const base = config.basePath;
  const page = getInsightBySlug(insightSlug);
  const enter = () => navigate(hrefFor(base, 'dashboard'));

  if (!page) {
    return (
      <div className={gw.gateway}>
        <GatewayNavbar onEnter={enter} />
        <div className={gw.gatewayInner}>
          <h1 className={gw.sectionTitle}>Article not found</h1>
          <Link to={hrefFor(base, 'insights')}>Operator knowledge base</Link>
        </div>
        <GatewayFooter />
      </div>
    );
  }

  const path = `${base}/insights/${page.slug}`;

  return (
    <div className={gw.gateway}>
      <PmSeoHead
        title={`${page.title} | ${config.productName}`}
        description={page.metaDescription}
        path={path}
        keywords={`${config.productName}, property management, ${page.headline}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: page.headline,
          description: page.metaDescription,
          url: getPmSiteUrl(config, path),
        }}
        siteBase={getPmSiteUrl(config)}
      />
      <GatewayNavbar onEnter={enter} />
      <div className={gw.gatewayInner}>
        <nav className={gw.locationBreadcrumb} aria-label="Breadcrumb">
          <Link to={hrefFor(base, '')}>Home</Link>
          <span aria-hidden="true"> / </span>
          <Link to={hrefFor(base, 'insights')}>Knowledge</Link>
          <span aria-hidden="true"> / </span>
          <span>{page.headline}</span>
        </nav>

        <header className={gw.locationHero}>
          <p className={gw.eyebrow}>Operator briefing</p>
          <h1 className={gw.sectionTitle}>{page.headline}</h1>
          <p className={gw.sectionSub}>{page.subhead}</p>
          <div className={gw.locationCtaRow}>
            <button type="button" className={gw.enterBtn} onClick={enter}>
              Enter live demo
              <Icon name="bolt" size={20} />
            </button>
          </div>
        </header>

        <article className={gw.locationArticle}>
          {page.sections?.map((s) => (
            <section key={s.heading}>
              <h2 className={gw.locationH2}>{s.heading}</h2>
              <p className={gw.locationProse}>{s.body}</p>
            </section>
          ))}

          {page.platforms?.map((p) => (
            <section key={p.name}>
              <h2 className={gw.locationH2}>{p.name}</h2>
              <p className={gw.locationProse}>{p.fit}</p>
              <p className={gw.locationProse} style={{ marginTop: 10 }}>
                <strong>ManyDoors:</strong> {p.manyDoors}
              </p>
            </section>
          ))}

          {page.gap && (
            <section>
              <h2 className={gw.locationH2}>The gap we fill</h2>
              <p className={gw.locationProse}>{page.gap}</p>
            </section>
          )}

          {page.valueAdds?.map((v) => (
            <section key={v.id}>
              <h2 className={gw.locationH2}>{v.title}</h2>
              <p className={gw.locationProse}>{v.hook}</p>
              <p className={gw.locationProse} style={{ marginTop: 10 }}>{v.proof}</p>
              <p className={gw.locationProse} style={{ marginTop: 10 }}>
                <em>{v.ownerLine}</em>
              </p>
            </section>
          ))}

          {page.closing && <p className={gw.locationProse}>{page.closing}</p>}

          <div className={gw.locationModuleLinks}>
            <Link to={hrefFor(base, 'insights')}>All briefings →</Link>
            <Link to={hrefFor(base, 'locations')}>Oregon markets →</Link>
            <Link to={hrefFor(base, 'features/savings')}>ROI calculator →</Link>
          </div>
        </article>
      </div>
      <GatewayFooter />
    </div>
  );
}
