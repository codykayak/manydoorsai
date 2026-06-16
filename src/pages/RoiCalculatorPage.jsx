import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePm } from '../context/PmContext';
import Icon from '../components/Icon';
import GatewayNavbar from '../components/GatewayNavbar';
import GatewayFooter from '../components/GatewayFooter';
import PmSeoHead from '../components/PmSeoHead';
import { PieChart, BarChart, LineChart } from '../components/charts/Charts';
import { computePortfolioRoi, DEFAULT_PORTFOLIO } from '../developer-admin/pitchData';
import { usd } from '../lib/finance';
import { getPmSiteUrl, localBusinessJsonLd } from '../content/localBusiness';
import { GATEWAY_ASSETS } from '../content/gatewayContent';
import { requestDemo } from '../lib/contactCta';
import { submitPmContact } from '../lib/pmSubmitContact';
import gw from './gateway.module.css';
import rc from './roiCalculator.module.css';

function hrefFor(base, route) {
  const b = (base || '/').replace(/\/$/, '');
  return route ? `${b}/${route}` : b;
}

const LINE_COLORS = ['#00d2d3', '#58a6ff', '#3fb950', '#d29922', '#a371f7', '#f85149'];

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function RoiCalculatorPage() {
  const { config } = usePm();
  const navigate = useNavigate();
  const base = config.basePath;
  const path = hrefFor(base, 'roi-calculator');

  const [units, setUnits] = useState(String(DEFAULT_PORTFOLIO.units));
  const [avgRent, setAvgRent] = useState(String(DEFAULT_PORTFOLIO.avgRent));
  const [properties, setProperties] = useState(String(DEFAULT_PORTFOLIO.properties));

  const roi = useMemo(
    () => computePortfolioRoi({
      units: Number(units) || 0,
      avgRent: Number(avgRent) || 0,
      properties: Number(properties) || 0,
    }),
    [units, avgRent, properties],
  );

  const pieData = roi.lines.map((l, i) => ({
    label: l.label,
    value: l.value,
    color: LINE_COLORS[i % LINE_COLORS.length],
  }));

  const barData = [...roi.lines]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map((l) => ({ label: l.key, value: l.value }));

  const ramp = useMemo(() => ({
    labels: MONTH_LABELS,
    series: [{
      label: 'Monthly AI impact ($)',
      points: MONTH_LABELS.map((_, i) => Math.round(roi.monthlyTotal * (0.35 + (i / 11) * 0.65))),
      color: '#00d2d3',
    }],
  }), [roi.monthlyTotal]);

  const reset = () => {
    setUnits(String(DEFAULT_PORTFOLIO.units));
    setAvgRent(String(DEFAULT_PORTFOLIO.avgRent));
    setProperties(String(DEFAULT_PORTFOLIO.properties));
  };

  // ── Email capture ──────────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const roiSummary = () => [
    'ROI calculator request — ManyDoors AI',
    `Units: ${roi.units.toLocaleString()} · Properties: ${roi.properties} · Avg rent: ${usd(roi.avgRent)}`,
    `Estimated annual AI impact: ${usd(roi.annualTotal)} (${usd(roi.monthlyTotal)}/mo · ${usd(roi.perUnitMonthly)}/unit/mo · ~${roi.fteEquivalent} FTE)`,
    'Breakdown (monthly):',
    ...roi.lines.map((l) => `  • ${l.label}: ${usd(l.value)}`),
  ].join('\n');

  const submitEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Enter an email so we can send your breakdown.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      await submitPmContact(
        {
          email,
          portfolioSize: `${roi.units.toLocaleString()} units`,
          summary: roiSummary(),
        },
        config.supportEmail,
      );
      setSent(true);
    } catch (err) {
      setError(err.message || 'Could not send. Email us directly at ' + config.supportEmail);
    } finally {
      setSending(false);
    }
  };

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: `${config.productName} ROI Calculator`,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: getPmSiteUrl(config, path),
      description:
        'Free ROI calculator for multifamily operators — estimate the annual labor, vacancy, maintenance, and fraud-prevention impact of an AI operations layer on top of your PMS.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      provider: { '@id': `${getPmSiteUrl(config, base)}#localbusiness` },
    },
    localBusinessJsonLd(config, base),
  ];

  return (
    <div className={gw.gateway}>
      <PmSeoHead
        title={`Multifamily ROI Calculator | ${config.productName}`}
        description="Free multifamily AI ROI calculator. Enter your unit count, average rent, and properties to estimate annual savings from resident deflection, maintenance triage, faster lease-up, pre-screening, and fraud prevention — no signup required."
        path={path}
        keywords={`${config.productName} ROI calculator, multifamily ROI, property management AI savings, NOI calculator, ${config.futureSite}`}
        ogImage={GATEWAY_ASSETS.investorImage}
        jsonLd={jsonLd}
      />
      <GatewayNavbar onEnter={() => navigate(hrefFor(base, 'dashboard'))} />

      <div className={gw.gatewayInner}>
        <header className={gw.featureHero}>
          <p className={gw.eyebrow}>
            <Icon name="chart" size={14} /> Free tool · no signup
          </p>
          <h1 className={gw.heroTitle}>Multifamily AI ROI calculator</h1>
          <p className={gw.heroLead}>
            Estimate the annual impact of running {config.productName} on top of your existing PMS.
            Adjust your portfolio below — results update instantly. Numbers are illustrative; we
            replace them with your real metrics during a 30–60 day pilot.
          </p>
        </header>

        <div className={rc.layout}>
          <aside className={rc.controls} aria-label="Portfolio inputs">
            <h2 className={rc.controlsTitle}>Your portfolio</h2>

            <div className={rc.field}>
              <div className={rc.fieldHead}>
                <label className={rc.fieldLabel} htmlFor="roi-units">Units under management</label>
                <span className={rc.fieldValue}>{(Number(units) || 0).toLocaleString()}</span>
              </div>
              <input
                id="roi-units"
                className={rc.range}
                type="range"
                min="100"
                max="20000"
                step="100"
                value={Number(units) || 100}
                onChange={(e) => setUnits(e.target.value)}
              />
              <input
                className={rc.numberInput}
                type="number"
                min="100"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                aria-label="Units (exact)"
              />
            </div>

            <div className={rc.field}>
              <div className={rc.fieldHead}>
                <label className={rc.fieldLabel} htmlFor="roi-rent">Average monthly rent</label>
                <span className={rc.fieldValue}>{usd(Number(avgRent) || 0)}</span>
              </div>
              <input
                id="roi-rent"
                className={rc.range}
                type="range"
                min="800"
                max="4000"
                step="25"
                value={Number(avgRent) || 800}
                onChange={(e) => setAvgRent(e.target.value)}
              />
              <input
                className={rc.numberInput}
                type="number"
                min="800"
                value={avgRent}
                onChange={(e) => setAvgRent(e.target.value)}
                aria-label="Average rent (exact)"
              />
            </div>

            <div className={rc.field}>
              <div className={rc.fieldHead}>
                <label className={rc.fieldLabel} htmlFor="roi-props">Number of properties</label>
                <span className={rc.fieldValue}>{Number(properties) || 0}</span>
              </div>
              <input
                id="roi-props"
                className={rc.range}
                type="range"
                min="1"
                max="120"
                step="1"
                value={Number(properties) || 1}
                onChange={(e) => setProperties(e.target.value)}
              />
              <input
                className={rc.numberInput}
                type="number"
                min="1"
                value={properties}
                onChange={(e) => setProperties(e.target.value)}
                aria-label="Properties (exact)"
              />
            </div>

            <button type="button" className={rc.resetBtn} onClick={reset}>
              Reset to sample portfolio
            </button>
          </aside>

          <div className={rc.results}>
            <div className={rc.headlineCard}>
              <div className={rc.headlineLabel}>Estimated annual AI impact</div>
              <div className={rc.headlineValue}>{usd(roi.annualTotal)}</div>
              <div className={rc.headlineSub}>
                {usd(roi.monthlyTotal)}/mo · {usd(roi.perUnitMonthly)}/unit/mo · ~{roi.fteEquivalent} FTE equivalent
              </div>
            </div>

            <div className={rc.kpiRow}>
              <div className={rc.kpiBox}>
                <div className={rc.kpiBoxValue}>{usd(roi.monthlyTotal)}</div>
                <div className={rc.kpiBoxLabel}>Monthly impact</div>
              </div>
              <div className={rc.kpiBox}>
                <div className={rc.kpiBoxValue}>{usd(roi.perUnitMonthly)}</div>
                <div className={rc.kpiBoxLabel}>Per unit / month</div>
              </div>
              <div className={rc.kpiBox}>
                <div className={rc.kpiBoxValue}>~{roi.fteEquivalent}</div>
                <div className={rc.kpiBoxLabel}>FTE equivalent</div>
              </div>
            </div>

            <div className={gw.chartGrid}>
              <div className={gw.chartCard}>
                <div className={gw.chartLabel}>Monthly value by lever</div>
                <PieChart data={pieData} size={180} formatVal={(v) => usd(v)} />
              </div>
              <div className={gw.chartCard}>
                <div className={gw.chartLabel}>Top savings drivers</div>
                <BarChart data={barData} height={200} formatY={(v) => `$${Math.round(v / 1000)}k`} />
              </div>
              <div className={`${gw.chartCard} ${gw.chartCardWide}`}>
                <div className={gw.chartLabel}>AI impact ramp (year 1)</div>
                <LineChart {...ramp} height={200} formatY={(v) => `$${Math.round(v / 1000)}k`} />
              </div>
            </div>

            <div className={gw.chartCard}>
              <div className={gw.chartLabel}>Where the savings come from</div>
              <table className={rc.table}>
                <thead>
                  <tr>
                    <th>Lever</th>
                    <th className={rc.num}>Per month</th>
                    <th className={rc.num}>Per year</th>
                  </tr>
                </thead>
                <tbody>
                  {roi.lines.map((l) => (
                    <tr key={l.key}>
                      <td>
                        <div className={rc.leverLabel}>{l.label}</div>
                        <div className={rc.leverDetail}>{l.detail}</div>
                      </td>
                      <td className={rc.num}>{usd(l.value)}</td>
                      <td className={rc.num}>{usd(l.value * 12)}</td>
                    </tr>
                  ))}
                  <tr className={rc.totalRow}>
                    <td>Total estimated impact</td>
                    <td className={rc.num}>{usd(roi.monthlyTotal)}</td>
                    <td className={rc.num}>{usd(roi.annualTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={rc.capture}>
              {sent ? (
                <div className={rc.captureSuccess}>
                  <Icon name="check" size={22} />
                  <p>Thanks! We received your numbers and will send a tailored ROI breakdown shortly.</p>
                </div>
              ) : (
                <>
                  <div>
                    <h2 className={gw.sectionTitle}>Email me this ROI breakdown</h2>
                    <p className={gw.sectionSub}>
                      We will send a copy of these numbers and follow up with a tailored estimate for your portfolio.
                    </p>
                  </div>
                  <form className={rc.captureForm} onSubmit={submitEmail}>
                    <input
                      className={rc.captureInput}
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <button type="submit" className={rc.captureBtn} disabled={sending}>
                      {sending ? 'Sending…' : 'Send my breakdown'}
                      <Icon name="download" size={16} />
                    </button>
                  </form>
                  {error && <p className={rc.captureError}>{error}</p>}
                  <p className={rc.captureNote}>
                    No spam. Prefer to talk it through?{' '}
                    <button
                      type="button"
                      className={gw.linkBtn}
                      onClick={() => requestDemo(config.bookingUrl)}
                    >
                      Book a 15-min demo
                    </button>
                    .
                  </p>
                </>
              )}
            </div>

            <div>
              <p className={rc.disclaimer}>
                <strong>How this is calculated.</strong> Estimates use conservative multifamily
                benchmarks applied to your inputs:
              </p>
              <ul className={rc.assumptions}>
                <li>~0.55 resident inquiries/unit/month, 58% AI deflection at ~$5 loaded labor each.</li>
                <li>~2.5 work orders/unit/year, ~18% deflected by guided self-help at ~$145/truck roll.</li>
                <li>~0.8% monthly turnover with ~2 vacancy-days saved per lease via faster speed-to-lead.</li>
                <li>Pre-screen automation, after-hours coverage, and amortized fraud/bad-tenancy avoidance.</li>
              </ul>
              <p className={rc.disclaimer}>
                Figures are illustrative and not a guarantee. We calibrate to your actual data during a pilot.
              </p>
            </div>
          </div>
        </div>

        <footer className={gw.footerCta}>
          <div className={gw.ctaRow}>
            <button type="button" className={gw.bookBtn} onClick={() => requestDemo(config.bookingUrl)}>
              Book a 15-min demo
              <Icon name="calendar" size={20} />
            </button>
            <button
              type="button"
              className={gw.enterBtnGhost}
              onClick={() => navigate(hrefFor(base, 'dashboard'))}
            >
              Explore live demo
              <Icon name="bolt" size={20} />
            </button>
          </div>
          <p className={gw.sectionSub} style={{ marginTop: 14 }}>
            See the modules behind these numbers — <Link to={hrefFor(base, 'features/communications')}>read feature breakdowns →</Link>
          </p>
        </footer>
      </div>

      <GatewayFooter />
    </div>
  );
}
