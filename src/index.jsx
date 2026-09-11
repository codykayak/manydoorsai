/**
 * Property Management module — entry point.
 *
 * Gateway landing at `/property-management`; operations app at sub-routes.
 */

import { lazy, Suspense, useState } from 'react';
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { PmProvider, usePm } from './context/PmContext';
import { FEATURE_CATEGORIES } from './config/featureRegistry';
import Icon from './components/Icon';
import ErrorBoundary from './components/ErrorBoundary';
import OnboardingBanner from './components/OnboardingBanner';
import OnboardingWizard from './components/OnboardingWizard';
import GatewayPage from './pages/GatewayPage';
import FeaturePage from './pages/FeaturePage';
import FaqPage from './pages/FaqPage';
import LocationPage from './pages/LocationPage';
import LocationsIndexPage from './pages/LocationsIndexPage';
import SavingsPage from './pages/SavingsPage';
import PlatformOverviewPage from './pages/PlatformOverviewPage';
import ProsLandingPage from './pages/ProsLandingPage';
import ProsTradePage from './pages/ProsTradePage';
import InsightsHubPage from './pages/InsightsHubPage';
import InsightPage from './pages/InsightPage';
import RoiCalculatorPage from './pages/RoiCalculatorPage';
import LeedsPage from './pages/LeedsPage';
import Dashboard from './pages/Dashboard';
import OwnerPortal from './pages/OwnerPortal';
import Communications from './pages/Communications';
import Leasing from './pages/Leasing';
import Maintenance from './pages/Maintenance';
import Residents from './pages/Residents';
import KnowledgeBase from './pages/KnowledgeBase';
import Settings from './pages/Settings';
import Compliance from './pages/Compliance';
import styles from './pm.module.css';
import './components/print.css';
import FloatingActions from './components/FloatingActions';

const DEV_ADMIN_ENABLED = import.meta.env.VITE_PM_DEV_ADMIN !== 'false';
const DevAdminRoute = DEV_ADMIN_ENABLED ? lazy(() => import('./devAdminRoute.jsx')) : null;

const PAGE_MAP = {
  dashboard: Dashboard,
  owner: OwnerPortal,
  communications: Communications,
  leasing: Leasing,
  maintenance: Maintenance,
  residents: Residents,
  knowledge: KnowledgeBase,
  compliance: Compliance,
  settings: Settings,
};

function normalizeBase(basePath) {
  const b = (basePath || '/').replace(/\/$/, '');
  return b || '/';
}

function hrefFor(base, route) {
  const b = normalizeBase(base);
  if (!route) return b;
  if (b === '/') return `/${route}`;
  return `${b}/${route}`;
}

function isGatewayPath(pathname, basePath) {
  const base = normalizeBase(basePath);
  if (pathname === base || pathname === `${base}/`) return true;
  const prefix = base === '/' ? '' : base;
  const prosGateway = pathname === `${prefix}/pros`
    || (pathname.startsWith(`${prefix}/pros/`) && !pathname.startsWith(`${prefix}/pros/app`));
  return (
    pathname.startsWith(`${prefix}/features`)
    || pathname.startsWith(`${prefix}/faq`)
    || pathname.startsWith(`${prefix}/locations`)
    || pathname.startsWith(`${prefix}/insights`)
    || pathname.startsWith(`${prefix}/roi-calculator`)
    || pathname === `${prefix}/overview`
    || pathname === `${prefix}/leeds`
    || pathname === `${prefix}/leads`
    || pathname.startsWith(`${prefix}/leeds/`)
    || pathname.startsWith(`${prefix}/leads/`)
    || prosGateway
    || pathname === `${prefix}/us-support`
  );
}

function isLeedsPath(pathname, basePath) {
  const base = normalizeBase(basePath);
  const prefix = base === '/' ? '' : base;
  return (
    pathname === `${prefix}/leeds`
    || pathname === `${prefix}/leads`
    || pathname.startsWith(`${prefix}/leeds/`)
    || pathname.startsWith(`${prefix}/leads/`)
  );
}

function Sidebar() {
  const { config, features } = usePm();
  const enabled = features.filter((f) => f.enabled);
  const base = config.basePath;
  const gatewayHome = hrefFor(base, '');
  const overviewHref = hrefFor(base, 'overview');

  const order = [
    FEATURE_CATEGORIES.CORE,
    FEATURE_CATEGORIES.OWNER,
    FEATURE_CATEGORIES.AUTOMATION,
    FEATURE_CATEGORIES.OPERATIONS,
    FEATURE_CATEGORIES.ADMIN,
  ];

  return (
    <aside className={styles.sidebar}>
      <NavLink to={gatewayHome} className={styles.brand} title="Home">
        {config.logoMenu || config.logoWordmark || config.logo ? (
          <img
            src={config.logoMenu || config.logoWordmark || config.logo}
            alt={config.productName}
            className={styles.brandMenuLogo}
          />
        ) : (
          <Icon name="home" size={28} />
        )}
      </NavLink>

      <NavLink
        to={gatewayHome}
        end
        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
        title="Marketing homepage"
      >
        <Icon name="home" size={18} className={styles.navIcon} />
        <span>Gateway home</span>
      </NavLink>

      <NavLink
        to={overviewHref}
        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
        title="Product overview and selling points"
      >
        <Icon name="grid" size={18} className={styles.navIcon} />
        <span>Platform overview</span>
      </NavLink>

      {order.map((cat) => {
        const items = enabled.filter((f) => f.category === cat);
        if (!items.length) return null;
        return (
          <div key={cat}>
            <div className={styles.sectionTitle} style={{ margin: '14px 0 6px', paddingLeft: 8 }}>{cat}</div>
            {items.map((f) => (
              <NavLink
                key={f.id}
                to={hrefFor(base, f.route)}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
              >
                <Icon name={f.icon} size={18} className={styles.navIcon} />
                <span>{f.name}</span>
              </NavLink>
            ))}
          </div>
        );
      })}

      <div className={styles.navSpacer} />
      {DEV_ADMIN_ENABLED && DevAdminRoute && (
        <NavLink
          to={hrefFor(base, 'developer-admin')}
          className={({ isActive }) => `${styles.navItem} ${styles.navDev} ${isActive ? styles.navActive : ''}`}
          title="Internal engineering docs, pitch deck, and tools"
        >
          <Icon name="settings" size={18} className={styles.navIcon} />
          <span>Developer admin</span>
        </NavLink>
      )}
      <div className={styles.sidebarFoot}>
        {config.productName} · {config.futureSite}
        <br />Data is local to this browser until Firebase is connected.
      </div>
    </aside>
  );
}

function DevAdminFallback() {
  return (
    <div className={styles.content}>
      <div className={styles.hint}>Loading developer tools…</div>
    </div>
  );
}

function ModuleInner() {
  const { config, features, onboardingComplete, completeOnboarding, featureMap, propertyProfile } = usePm();
  const location = useLocation();
  const enabledIds = new Set(features.filter((f) => f.enabled).map((f) => f.id));
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const defaultTechs = featureMap.maintenance?.config?.technicians || [];
  const gateway = isGatewayPath(location.pathname, config.basePath);
  const leeds = isLeedsPath(location.pathname, config.basePath);

  return (
    <div
      className={styles.app}
      style={{ '--pm-accent': config.accent, '--pm-accent-soft': config.accentSoft }}
    >
      {!gateway && <Sidebar />}
      <main className={gateway ? styles.mainFull : styles.main}>
        {!gateway && !onboardingComplete && (
          <OnboardingBanner onStart={() => setOnboardingOpen(true)} />
        )}
        <ErrorBoundary key={location.pathname}>
          <Routes>
            <Route index element={<GatewayPage />} />
            <Route path="overview" element={<PlatformOverviewPage />} />
            <Route path="features/savings" element={<SavingsPage />} />
            <Route path="features/:slug" element={<FeaturePage />} />
            <Route path="us-support" element={<Navigate to={hrefFor(config.basePath, 'features/savings')} replace />} />
            <Route path="pros" element={<ProsLandingPage />} />
            <Route path="pros/app" element={<Navigate to={`${hrefFor(config.basePath, 'maintenance')}?panel=pros`} replace />} />
            <Route path="pros/:tradeSlug" element={<ProsTradePage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="locations" element={<LocationsIndexPage />} />
            <Route path="locations/:citySlug" element={<LocationPage />} />
            <Route path="insights" element={<InsightsHubPage />} />
            <Route path="insights/:insightSlug" element={<InsightPage />} />
            <Route path="roi-calculator" element={<RoiCalculatorPage />} />
            <Route path="leeds/eugene" element={<LeedsPage />} />
            <Route path="leeds" element={<LeedsPage />} />
            <Route path="leads/eugene" element={<Navigate to={hrefFor(config.basePath, 'leeds/eugene')} replace />} />
            <Route path="leads" element={<Navigate to={hrefFor(config.basePath, 'leeds')} replace />} />
            {features.map((f) => {
              if (!f.route) return null;
              const Page = PAGE_MAP[f.id];
              if (!Page || !enabledIds.has(f.id)) return null;
              return <Route key={f.id} path={f.route} element={<Page />} />;
            })}
            {DEV_ADMIN_ENABLED && DevAdminRoute && (
              <Route
                path="developer-admin"
                element={(
                  <Suspense fallback={<DevAdminFallback />}>
                    <DevAdminRoute />
                  </Suspense>
                )}
              />
            )}
            <Route path="*" element={<Navigate to={config.basePath} replace />} />
          </Routes>
        </ErrorBoundary>
      </main>

      {!leeds && <FloatingActions />}

      {!gateway && (
        <OnboardingWizard
          key={onboardingOpen ? 'open' : 'closed'}
          open={onboardingOpen}
          onClose={() => setOnboardingOpen(false)}
          onComplete={completeOnboarding}
          defaultTechnicians={defaultTechs}
          initialProfile={propertyProfile}
        />
      )}
    </div>
  );
}

export default function PropertyManagement() {
  return (
    <PmProvider>
      <ModuleInner />
    </PmProvider>
  );
}
