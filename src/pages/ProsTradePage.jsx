import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePm } from '../context/PmContext';
import GatewayNavbar from '../components/GatewayNavbar';
import GatewayFooter from '../components/GatewayFooter';
import PmSeoHead from '../components/PmSeoHead';
import Icon from '../components/Icon';
import { PROS_APK_URL, PROS_BY_SLUG, PROS_TRADES } from '../content/prosContent';
import gw from './gateway.module.css';

function hrefFor(base, route) {
  const b = (base || '/').replace(/\/$/, '');
  return route ? `${b}/${route}` : b;
}

export default function ProsTradePage() {
  const { tradeSlug } = useParams();
  const { config } = usePm();
  const navigate = useNavigate();
  const base = config.basePath;
  const trade = PROS_BY_SLUG[tradeSlug];
  const enter = () => navigate(hrefFor(base, 'dashboard'));
  const hqHref = `${hrefFor(base, 'maintenance')}?panel=pros`;

  if (!trade) {
    return (
      <div className={gw.gateway}>
        <GatewayNavbar onEnter={enter} />
        <div className={gw.gatewayInner}>
          <h1 className={gw.sectionTitle}>Trade not found</h1>
          <Link to={hrefFor(base, 'pros')}>Back to Pros</Link>
        </div>
        <GatewayFooter />
      </div>
    );
  }

  return (
    <div className={gw.gateway}>
      <PmSeoHead
        title={trade.seoTitle || `ManyDoors AI Pros for ${trade.name}`}
        description={trade.seoDescription || trade.description}
        path={`${base}/pros/${trade.slug}`}
      />
      <GatewayNavbar onEnter={enter} />

      <div className={gw.gatewayInner}>
        <nav className={gw.locationBreadcrumb} aria-label="Breadcrumb">
          <Link to={hrefFor(base, '')}>Home</Link>
          <span aria-hidden="true"> / </span>
          <Link to={hrefFor(base, 'pros')}>Pros</Link>
          <span aria-hidden="true"> / </span>
          <span>{trade.name}</span>
        </nav>

        <header className={gw.featureHero}>
          <p className={gw.eyebrow} style={{ color: trade.accent, borderColor: `${trade.accent}55` }}>
            <Icon name={trade.icon} size={14} />
            {trade.heroEyebrow}
          </p>
          <h1 className={gw.heroTitle}>
            {trade.name} <span style={{ color: trade.accent }}>field intelligence</span>
          </h1>
          <p className={gw.prosTradeTag}>{trade.tagline}</p>
          <p className={gw.heroLead}>{trade.description}</p>
          <div className={gw.heroActions}>
            <Link to={hqHref} className={gw.enterBtn}>
              <Icon name="wrench" size={18} />
              Set up {trade.shortName} HQ
            </Link>
            <a href={PROS_APK_URL} className={gw.secondaryBtn}>
              Get Diagnose APK
              <Icon name="download" size={18} />
            </a>
          </div>
        </header>

        <section>
          <h2 className={gw.sectionTitle}>What techs diagnose in the field</h2>
          <p className={gw.sectionSub}>
            The {trade.shortName} pack in Diagnose covers the calls your shop runs every day — with voice-first
            guidance and OEM manual search when you need model-specific detail.
          </p>
          <div className={gw.prosCatGrid}>
            {trade.categories.map((cat) => (
              <div key={cat.label} className={gw.prosCard}>
                <h3>{cat.label}</h3>
                <ul className={gw.bulletList}>
                  {cat.examples.map((ex) => <li key={ex}>{ex}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className={gw.prosGrowGrid}>
          <div>
            <p className={gw.eyebrow}>Tap-to-ask prompts</p>
            <h2 className={gw.sectionTitle}>Start talking in seconds</h2>
            <ul className={gw.prosPromptList}>
              {trade.quickPrompts.map((prompt) => (
                <li key={prompt}>“{prompt}”</li>
              ))}
            </ul>
          </div>
          <div>
            <p className={gw.eyebrow}>Common equipment</p>
            <h2 className={gw.sectionTitle}>Built for real trucks</h2>
            <div className={gw.prosChipRow}>
              {trade.commonEquipment.map((item) => (
                <span key={item} className={gw.prosChip}>{item}</span>
              ))}
            </div>
            <h3 className={gw.prosColTitle} style={{ marginTop: 28 }}>Pros HQ for {trade.shortName} shops</h3>
            <ul className={gw.bulletList}>
              {trade.prosFeatures.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
          </div>
        </section>

        <section>
          <h2 className={gw.prosColTitle}>Other trade packs</h2>
          <div className={gw.prosChipRow}>
            {PROS_TRADES.filter((t) => t.slug !== trade.slug).map((t) => (
              <Link key={t.slug} to={hrefFor(base, `pros/${t.slug}`)} className={gw.prosChip}>
                {t.name}
              </Link>
            ))}
          </div>
        </section>
      </div>

      <GatewayFooter />
    </div>
  );
}
