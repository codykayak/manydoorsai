import { useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePm } from '../context/PmContext';
import Icon from '../components/Icon';
import GatewayNavbar from '../components/GatewayNavbar';
import PmSeoHead from '../components/PmSeoHead';
import { LineChart, BarChart, GroupedBar, PieChart } from '../components/charts/Charts';
import { summarize, usd, pct } from '../lib/finance';
import {
  computePortfolioRoi,
  DEFAULT_PORTFOLIO,
  GATEWAY_MODULES,
  DEFLECTION_COMPARISON,
} from '../developer-admin/pitchData';
import {
  GATEWAY_ASSETS,
  US_SUPPORT,
  FEATURE_PAGES,
  gatewayJsonLd,
} from '../content/gatewayContent';
import { TRUST_SIGNALS, TESTIMONIALS, CLIENT_LOGOS } from '../content/socialProof';
import { requestDemo } from '../lib/contactCta';
import GatewayFooter from '../components/GatewayFooter';
import EnterprisePitchSection from '../components/pitch/EnterprisePitchSection';
import PitchModuleCard from '../components/pitch/PitchModuleCard';
import pm from '../pm.module.css';
import gw from './gateway.module.css';

function hrefFor(base, route) {
  const b = (base || '/').replace(/\/$/, '');
  return route ? `${b}/${route}` : b;
}

export default function GatewayPage() {
  const { config, tenant } = usePm();
  const navigate = useNavigate();
  const base = config.basePath;
  const videoRef = useRef(null);

  const units = (tenant?.properties || []).reduce((s, p) => s + (p.units || 0), 0) || DEFAULT_PORTFOLIO.units;
  const properties = (tenant?.properties || []).length || DEFAULT_PORTFOLIO.properties;

  const roi = useMemo(
    () => computePortfolioRoi({ units, avgRent: DEFAULT_PORTFOLIO.avgRent, properties }),
    [units, properties],
  );

  const fin = useMemo(() => summarize(null), []);

  const roiRamp = useMemo(() => {
    const ramp = Array.from({ length: 12 }, (_, i) => Math.round(roi.monthlyTotal * (0.35 + (i / 11) * 0.65)));
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      series: [{ label: 'Monthly AI impact ($)', points: ramp, color: '#00d2d3' }],
    };
  }, [roi.monthlyTotal]);

  const pieData = roi.lines.map((l, i) => ({
    label: l.label,
    value: l.value,
    color: ['#00d2d3', '#58a6ff', '#3fb950', '#d29922', '#a371f7', '#f85149'][i % 6],
  }));

  const enter = () => navigate(hrefFor(base, 'dashboard'));
  const bookDemo = () => requestDemo(config.bookingUrl);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {});
  }, []);

  const seoTitle = `${config.productName} | AI Property Management Software — NOI, Leasing & Maintenance`;
  const seoDesc =
    `${config.productName} is AI property management software for Oregon multifamily operators — Portland, Eugene, Salem, Corvallis & Bend. HQ in Eugene, OR. 24/7 resident communications, automated leasing, maintenance triage, and owner-grade NOI reporting.`;

  return (
    <div className={gw.gateway}>
      <PmSeoHead
        title={seoTitle}
        description={seoDesc}
        path={base}
        keywords={`ManyDoors AI, property management software, AI leasing, maintenance triage, multifamily NOI, ${config.futureSite}, investor property management`}
        ogImage={GATEWAY_ASSETS.softwareImage}
        jsonLd={gatewayJsonLd(config, base)}
      />
      <GatewayNavbar onEnter={enter} />

      <section className={gw.videoHero} aria-label="Hero">
        <video
          ref={videoRef}
          className={gw.videoBg}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={GATEWAY_ASSETS.heroVideo} type="video/mp4" />
        </video>
        <div className={gw.videoOverlay} />
        <div className={gw.videoContent}>
          <p className={gw.eyebrow}>Multifamily operations platform</p>
          <h1 className={gw.videoTitle}>
            Protect NOI. Prove ROI. Run the portfolio on AI — not overtime.
          </h1>
          <p className={gw.videoLead}>
            {config.productName} is the AI operations layer on top of the PMS you already use:
            24/7 resident communication, automated leasing, and maintenance triage — with owner-grade
            NOI reporting and U.S.-based support on call.
          </p>
          <div className={gw.ctaRow}>
            <button type="button" className={gw.bookBtn} onClick={bookDemo}>
              Book a 15-min demo
              <Icon name="calendar" size={20} />
            </button>
            <button type="button" className={gw.enterBtnGhost} onClick={enter}>
              Explore live demo
              <Icon name="bolt" size={20} />
            </button>
          </div>
          <p className={gw.enterHint}>
            No rip-and-replace · works on top of Yardi, RealPage, AppFolio & Entrata · U.S.-based team
          </p>
        </div>
      </section>

      <div className={gw.gatewayInner}>
        <section className={gw.trustStrip} aria-label="Why operators trust ManyDoors AI">
          {TRUST_SIGNALS.map((t) => (
            <div key={t.label} className={gw.trustItem}>
              <Icon name={t.icon} size={22} className={gw.trustIcon} />
              <div>
                <div className={gw.trustLabel}>{t.label}</div>
                <div className={gw.trustSub}>{t.sub}</div>
              </div>
            </div>
          ))}
        </section>

        {CLIENT_LOGOS.length > 0 && (
          <section className={gw.logoStrip} aria-label="Operators using ManyDoors AI">
            <span className={gw.logoStripLabel}>Trusted by multifamily operators</span>
            <div className={gw.logoStripRow}>
              {CLIENT_LOGOS.map((logo) => (
                <img key={logo.name} src={logo.src} alt={logo.name} className={gw.clientLogo} loading="lazy" />
              ))}
            </div>
          </section>
        )}

        <section className={gw.softwareSection} aria-labelledby="software-heading">
          <div className={gw.softwareCopy}>
            <h2 id="software-heading" className={gw.sectionTitle}>
              Property management software built for operators and investors
            </h2>
            <p className={gw.sectionSub}>
              One platform replaces scattered inboxes, leasing spreadsheets, and after-hours answering services.
              ManyDoors AI connects to the PMS you already run — Yardi, RealPage, AppFolio, Entrata — and layers
              intelligent automation without a rip-and-replace project.
            </p>
            <ul className={gw.bulletList}>
              <li>AI answers resident questions from your property knowledge base — not generic chatbots</li>
              <li>Leasing pipeline with speed-to-lead, pre-screen, and application fraud audit</li>
              <li>Maintenance triage with emergency routing and self-help deflection</li>
            </ul>
          </div>
          <img
            src={GATEWAY_ASSETS.softwareImage}
            alt={`${config.productName} property management software dashboard for multifamily operators`}
            className={gw.softwareImg}
            width={640}
            height={420}
            loading="eager"
          />
        </section>

        <div className={gw.kpiStrip}>
          <div className={gw.kpi}>
            <div className={gw.kpiLabel}>Illustrative annual AI impact</div>
            <div className={`${gw.kpiValue} ${gw.kpiValueAccent}`}>{usd(roi.annualTotal)}</div>
            <div className={gw.kpiSub}>{usd(roi.perUnitMonthly)}/unit/mo · {roi.fteEquivalent} FTE equivalent</div>
          </div>
          <div className={gw.kpi}>
            <div className={gw.kpiLabel}>Portfolio NOI — YTD</div>
            <div className={gw.kpiValue}>{usd(fin.noiYTD)}</div>
            <div className={gw.kpiSub}>
              {fin.noiYTDvsBudgetPct >= 0 ? '+' : ''}{pct(fin.noiYTDvsBudgetPct, 1)} vs budget
            </div>
          </div>
          <div className={gw.kpi}>
            <div className={gw.kpiLabel}>NOI — month to date</div>
            <div className={gw.kpiValue}>{usd(fin.noiMTD)}</div>
            <div className={gw.kpiSub}>Operating margin {pct(fin.operatingMargin)}</div>
          </div>
          <div className={gw.kpi}>
            <div className={gw.kpiLabel}>Units under management</div>
            <div className={gw.kpiValue}>{units.toLocaleString()}</div>
            <div className={gw.kpiSub}>{properties} properties · demo portfolio</div>
          </div>
        </div>

        <section className={gw.supportBanner} aria-label="U.S. support">
          <Icon name="shield" size={28} className={gw.supportIcon} />
          <div>
            <h2 className={gw.supportTitle}>{US_SUPPORT.headline}</h2>
            <p className={gw.sectionSub}>{US_SUPPORT.body}</p>
            <p className={gw.localAreasLink}>
              Headquartered in Eugene, OR —{' '}
              <Link to={hrefFor(base, 'locations')}>Oregon service areas</Link>
              {' '}(Portland, Salem, Corvallis, Bend)
            </p>
          </div>
        </section>

        {TESTIMONIALS.length > 0 && (
          <section aria-label="What operators say">
            <div className={gw.sectionHead}>
              <h2 className={gw.sectionTitle}>What operators say</h2>
              <p className={gw.sectionSub}>Results from teams running ManyDoors AI on top of their PMS.</p>
            </div>
            <div className={gw.testimonialGrid}>
              {TESTIMONIALS.map((t) => (
                <figure key={`${t.name}-${t.company}`} className={gw.testimonialCard}>
                  <Icon name="star" size={18} className={gw.testimonialStar} />
                  <blockquote className={gw.testimonialQuote}>“{t.quote}”</blockquote>
                  <figcaption className={gw.testimonialMeta}>
                    <span className={gw.testimonialName}>{t.name}</span>
                    {(t.title || t.company) && (
                      <span className={gw.testimonialRole}>
                        {[t.title, t.company].filter(Boolean).join(', ')}
                        {t.units ? ` · ${t.units}` : ''}
                      </span>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className={gw.sectionHead}>
            <h2 className={gw.sectionTitle}>Where the ROI comes from</h2>
            <p className={gw.sectionSub}>
              Illustrative model for a {units.toLocaleString()}-unit portfolio — replace with pilot metrics after 30–60 days.
            </p>
          </div>
          <div className={gw.chartGrid}>
            <div className={gw.chartCard}>
              <div className={gw.chartLabel}>Monthly value by lever</div>
              <PieChart data={pieData} size={180} formatVal={(v) => usd(v)} />
            </div>
            <div className={gw.chartCard}>
              <div className={gw.chartLabel}>AI impact ramp (year 1)</div>
              <LineChart {...roiRamp} height={200} formatY={(v) => `$${Math.round(v / 1000)}k`} />
            </div>
            <div className={gw.chartCard}>
              <div className={gw.chartLabel}>Staff vs auto-resolved volume</div>
              <GroupedBar
                labels={DEFLECTION_COMPARISON.labels}
                series={DEFLECTION_COMPARISON.series}
                height={200}
                formatY={(v) => `${v}%`}
              />
            </div>
            <div className={gw.chartCard}>
              <div className={gw.chartLabel}>Top savings drivers</div>
              <BarChart
                data={roi.lines.slice(0, 4).map((l) => ({ label: l.key, value: l.value }))}
                height={200}
                formatY={(v) => `$${Math.round(v / 1000)}k`}
              />
            </div>
          </div>
        </section>

        <EnterprisePitchSection />

        <section>
          <div className={gw.sectionHead}>
            <h2 className={gw.sectionTitle}>Five modules. One platform.</h2>
            <p className={gw.sectionSub}>
              Everything behind the Enter button — ready to explore in the live demo.{' '}
              <Link to={hrefFor(base, 'features/communications')}>Read feature breakdowns →</Link>
            </p>
          </div>
          <div className={`${pm.grid} ${pm.cols2}`}>
            {GATEWAY_MODULES.map((mod) => (
              <PitchModuleCard
                key={mod.id}
                mod={mod}
                to={hrefFor(base, `features/${mod.featureSlug}`)}
              />
            ))}
          </div>
        </section>

        <section>
          <div className={gw.sectionHead}>
            <h2 className={gw.sectionTitle}>Deep dives by feature</h2>
            <p className={gw.sectionSub}>How each module saves time and money — with U.S. support behind every release.</p>
          </div>
          <div className={gw.featureLinkGrid}>
            {FEATURE_PAGES.map((f) => (
              <Link key={f.slug} to={hrefFor(base, `features/${f.slug}`)} className={gw.featureLinkCard}>
                <Icon name={f.icon} size={20} />
                <div>
                  <div className={gw.featureLinkTitle}>{f.title}</div>
                  <div className={gw.kpiSub}>{f.tagline}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <footer className={gw.footerCta}>
          <div className={gw.ctaRow}>
            <button type="button" className={gw.bookBtn} onClick={bookDemo}>
              Book a 15-min demo
              <Icon name="calendar" size={20} />
            </button>
            <button type="button" className={gw.enterBtnGhost} onClick={enter}>
              Enter {config.productName}
              <Icon name="bolt" size={20} />
            </button>
          </div>
        </footer>
      </div>

      <GatewayFooter />
    </div>
  );
}
