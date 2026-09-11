import { Link, useNavigate } from 'react-router-dom';
import { usePm } from '../context/PmContext';
import GatewayNavbar from '../components/GatewayNavbar';
import GatewayFooter from '../components/GatewayFooter';
import PmSeoHead from '../components/PmSeoHead';
import Icon from '../components/Icon';
import { LineChart } from '../components/charts/Charts';
import {
  PROS_APK_URL,
  PROS_FIELD_AI,
  PROS_FLOW,
  PROS_HERO_POSTER,
  PROS_HERO_VIDEO,
  PROS_INCLUDED_FEATURES,
  PROS_KNOWLEDGE_GROWTH,
  PROS_PILLARS,
  PROS_PLANS,
  PROS_TRADES,
} from '../content/prosContent';
import gw from './gateway.module.css';

function hrefFor(base, route) {
  const b = (base || '/').replace(/\/$/, '');
  return route ? `${b}/${route}` : b;
}

export default function ProsLandingPage() {
  const { config } = usePm();
  const navigate = useNavigate();
  const base = config.basePath;
  const enter = () => navigate(hrefFor(base, 'dashboard'));
  const hqHref = `${hrefFor(base, 'maintenance')}?panel=pros`;
  const adminHref = `${hrefFor(base, 'maintenance')}?panel=pros`;

  return (
    <div className={gw.gateway}>
      <PmSeoHead
        title={`ManyDoors AI Pros — Living field knowledge for trade companies`}
        description="Dispatch jobs, grow a living knowledge base from every tech in the field, and run your shop from one HQ. Built for HVAC, plumbing, electrical, pool, property, and fiber teams."
        path={`${base}/pros`}
        keywords="ManyDoors AI Pros, field service AI, HVAC diagnosis, plumbing app, electrical trade software, multifamily maintenance"
      />
      <GatewayNavbar onEnter={enter} />

      <section className={`${gw.videoHero} ${gw.prosVideoHero}`} aria-label="ManyDoors AI Pros field operations">
        <video
          className={gw.videoBg}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={PROS_HERO_POSTER}
        >
          <source src={PROS_HERO_VIDEO} type="video/mp4" />
        </video>
        <div className={gw.videoOverlay} />
        <div className={gw.videoContent}>
          <p className={gw.eyebrow}>
            <Icon name="spark" size={14} />
            Living knowledge base
          </p>
          <h1 className={gw.videoTitle}>
            Field intelligence that <span className={gw.prosAccentWord}>grows</span> with every job.
          </h1>
          <p className={gw.videoLead}>
            ManyDoors AI Pros is HQ for trade companies — dispatch, team roster, periodic GPS, and a knowledge base
            pulled from the techs actually turning wrenches. Diagnose in the truck; wisdom compounds in the cloud.
          </p>
          <div className={gw.ctaRow}>
            <Link to={hqHref} className={gw.bookBtn}>
              <Icon name="wrench" size={20} />
              Launch company HQ
            </Link>
            <a href="#how-it-grows" className={gw.enterBtnGhost}>
              <Icon name="book" size={20} />
              See how it grows
            </a>
            <Link to={adminHref} className={gw.enterBtnGhost}>
              Open admin
            </Link>
          </div>
          <p className={gw.enterHint}>
            Field app: <strong>Diagnose</strong> · Admin: Maintenance → ManyDoors AI Pros HQ
          </p>
        </div>
      </section>

      <div className={gw.gatewayInner}>
        <section>
          <div className={gw.sectionHead}>
            <h2 className={gw.sectionTitle}>Built for your trade</h2>
            <p className={gw.sectionSub}>
              Each pack ships with field prompts, equipment playbooks, and Pros HQ workflows tuned to how your shop runs.
            </p>
          </div>
          <div className={gw.prosTradeGrid}>
            {PROS_TRADES.map((t) => (
              <Link key={t.slug} to={hrefFor(base, `pros/${t.slug}`)} className={gw.prosTradeCard}>
                <div className={gw.prosTradeIcon} style={{ background: `${t.accent}22`, color: t.accent }}>
                  <Icon name={t.icon} size={20} />
                </div>
                <h3>{t.name}</h3>
                <p className={gw.prosTradeTag} style={{ color: t.accent }}>{t.tagline}</p>
                <p>{t.description}</p>
                <span className={gw.moduleLink}>Explore pack →</span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className={gw.sectionTitle}>AI for the field techs has arrived</h2>
          <div className={gw.prosFeatureList}>
            {PROS_FIELD_AI.map((f) => (
              <div key={f.title} className={gw.prosFeatureRow}>
                <Icon name={f.icon} size={18} />
                <div>
                  <strong>{f.title}</strong>
                  <p>{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-grows">
          <div className={gw.prosGrowGrid}>
            <div>
              <h2 className={gw.sectionTitle}>A knowledge base that breathes</h2>
              <p className={gw.sectionSub}>
                Unlike static PDF binders, Pros aggregates field tips, diagnose feedback, manual excerpts, and job
                outcomes into charts your managers can actually use.
              </p>
              <ul className={gw.bulletList}>
                <li>Field tips from every truck</li>
                <li>Diagnose “that worked” feedback</li>
                <li>OEM manual RAG ingest</li>
                <li>Job completion fixes</li>
              </ul>
            </div>
            <div className={gw.chartCard}>
              <div className={gw.chartLabel}>Example shop growth</div>
              <LineChart {...PROS_KNOWLEDGE_GROWTH} height={220} formatY={(v) => String(v)} />
            </div>
          </div>
        </section>

        <section>
          <div className={gw.sectionHead}>
            <h2 className={gw.sectionTitle}>Built for shops, not spreadsheets</h2>
            <p className={gw.sectionSub}>Dispatch, notify, locate, and learn — without bolting together five different tools.</p>
          </div>
          <div className={gw.prosGrid}>
            {PROS_PILLARS.map((p) => (
              <div key={p.title} className={gw.prosCard}>
                <Icon name={p.icon} size={22} />
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className={gw.prosLoop}>
        <div className={gw.gatewayInner}>
          <p className={gw.eyebrow}>The loop</p>
          <h2 className={gw.sectionTitle}>Diagnose → document → compound</h2>
          <div className={gw.prosLoopGrid}>
            {PROS_FLOW.map((f) => (
              <div key={f.step} className={gw.prosLoopCard}>
                <div className={gw.prosLoopStep}>{f.step}</div>
                <h3>{f.title}</h3>
                <p>{f.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className={gw.gatewayInner}>
        <section id="pricing">
          <div className={gw.sectionHead}>
            <h2 className={gw.sectionTitle}>Everything your shop runs on</h2>
            <p className={gw.sectionSub}>
              Field AI, dispatch, work orders, parts, and reporting — one platform from the truck to the office.
            </p>
          </div>
          <div className={gw.prosPricingGrid}>
            <div>
              <h3 className={gw.prosColTitle}>Included in every plan</h3>
              <ul className={gw.prosIncludeList}>
                {PROS_INCLUDED_FEATURES.map((f) => (
                  <li key={f.title}>
                    <Icon name={f.icon} size={18} />
                    <div>
                      <strong>{f.title}</strong>
                      <p>{f.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className={gw.prosColTitle}>Monthly pricing</h3>
              <div className={gw.prosPlanGrid}>
                {PROS_PLANS.map((plan) => (
                  <article key={plan.id} className={`${gw.prosPlan} ${plan.featured ? gw.prosPlanFeatured : ''}`}>
                    {plan.featured ? <span className={gw.prosPlanBadge}>Popular</span> : null}
                    <h4>{plan.name}</h4>
                    <div className={gw.prosPlanPrice}>
                      {plan.price}
                      <span>{plan.period}</span>
                    </div>
                    <p className={gw.prosPlanSeats}>{plan.seats}</p>
                    <p>{plan.detail}</p>
                  </article>
                ))}
              </div>
              <p className={gw.kpiSub} style={{ marginTop: 14 }}>
                Live AI usage is billed separately at platform rates. Contact us for annual billing or enterprise SLAs.
              </p>
              <Link to={hqHref} className={gw.enterBtn} style={{ marginTop: 16, display: 'inline-flex' }}>
                Start company HQ
                <Icon name="bolt" size={18} />
              </Link>
            </div>
          </div>
        </section>

        <section className={gw.prosCta}>
          <h2 className={gw.sectionTitle}>Ready to wire up your shop?</h2>
          <p className={gw.sectionSub}>
            Create your company HQ, invite techs with a code, and point them to Diagnose. Your knowledge base starts
            growing on the first job.
          </p>
          <div className={gw.ctaRow}>
            <Link to={hqHref} className={gw.bookBtn}>
              Get started
              <Icon name="bolt" size={18} />
            </Link>
            <a href={PROS_APK_URL} className={gw.enterBtnGhost}>
              <Icon name="download" size={18} />
              Download Diagnose APK
            </a>
          </div>
        </section>
      </div>

      <GatewayFooter />
    </div>
  );
}
