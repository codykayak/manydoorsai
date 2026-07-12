/**
 * Property Management module — entry point.
 *
 * Gateway landing at index; operations app at sub-routes with PM vs Owner roles.
 */

import { lazy, Suspense, useState } from 'react';
import { Routes, Route, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { PmProvider, usePm } from './context/PmContext';
import { FEATURE_CATEGORIES } from './config/featureRegistry';
import Icon from './components/Icon';
import ErrorBoundary from './components/ErrorBoundary';
import OnboardingBanner from './components/OnboardingBanner';
import OnboardingWizard from './components/OnboardingWizard';
import GuidedTour from './components/GuidedTour';
import GatewayPage from './pages/GatewayPage';
import FeaturePage from './pages/FeaturePage';
import FaqPage from './pages/FaqPage';
import LocationPage from './pages/LocationPage';
import LocationsIndexPage from './pages/LocationsIndexPage';
import RoiCalculatorPage from './pages/RoiCalculatorPage';
import Dashboard from './pages/Dashboard';
import OwnerPortal from './pages/OwnerPortal';
import OwnerHome from './pages/OwnerHome';
import Communications from './pages/Communications';
import Leasing from './pages/Leasing';
import Maintenance from './pages/Maintenance';
import Residents from './pages/Residents';
import KnowledgeBase from './pages/KnowledgeBase';
import Settings from './pages/Settings';
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
  settings: Settings,
};

const OWNER_NAV = [
  { id: 'owner-home', name: 'Owner Home', icon: 'home', route: 'owner-home' },
  { id: 'owner', name: 'Portfolio Analytics', icon: 'chart', route: 'owner' },
  { id: 'settings', name: 'Settings & Integrations', icon: 'settings', route: 'settings' },
];

const PM_FEATURE_IDS = new Set([
  'dashboard', 'communications', 'leasing', 'maintenance', 'residents', 'knowledge', 'settings', 'owner',
]);

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
  return (
    pathname.startsWith(`${prefix}/features`)
    || pathname.startsWith(`${prefix}/faq`)
    || pathname.startsWith(`${prefix}/locations`)
    || pathname.startsWith(`${prefix}/roi-calculator`)
  );
}

function RoleSwitcher() {
  const { demoRole, setDemoRole, config } = usePm();
  const navigate = useNavigate();

  function switchRole(role) {
    setDemoRole(role);
    navigate(hrefFor(config.basePath, role === 'owner' ? 'owner-home' : 'dashboard'));
  }

  return (
    <div className={styles.roleSwitch} data-tour="tour-role">
      <button
        type="button"
        className={`${styles.roleBtn} ${demoRole === 'pm' ? styles.roleBtnActive : ''}`}
        onClick={() => switchRole('pm')}
      >
        Property Manager
      </button>
      <button
        type="button"
        className={`${styles.roleBtn} ${demoRole === 'owner' ? styles.roleBtnActive : ''}`}
        onClick={() => switchRole('owner')}
      >
        Owner
      </button>
    </div>
  );
}

function Sidebar() {
  const {
    config, tenant, features, demoRole, startTour, syncStatus, onboardingComplete,
  } = usePm();
  const enabled = features.filter((f) => f.enabled);
  const base = config.basePath;

  const order = [
    FEATURE_CATEGORIES.CORE,
    FEATURE_CATEGORIES.OWNER,
    FEATURE_CATEGORIES.AUTOMATION,
    FEATURE_CATEGORIES.OPERATIONS,
    FEATURE_CATEGORIES.ADMIN,
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        {config.logo ? (
          <img src={config.logo} alt={config.companyName} />
        ) : (
          <Icon name="home" size={28} />
        )}
        <div className={styles.brandText}>
          <span className={styles.brandName}>{config.productName}</span>
          <span className={styles.brandSub}>{tenant?.name || config.companyName}</span>
        </div>
      </div>

      <div className={styles.tenantPill}>
        <span className={styles.tenantDot} />
        <span>{tenant?.name || 'Demo Tenant'}</span>
      </div>

      <RoleSwitcher />

      <NavLink
        to={hrefFor(base, '')}
        end
        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
      >
        <Icon name="home" size={18} className={styles.navIcon} />
        <span>Gateway home</span>
      </NavLink>

      {demoRole === 'owner' ? (
        <div>
          <div className={styles.sectionTitle} style={{ margin: '14px 0 6px', paddingLeft: 8 }}>Owner portal</div>
          {OWNER_NAV.map((f) => (
            <NavLink
              key={f.id}
              to={hrefFor(base, f.route)}
              data-tour={f.id === 'owner-home' ? 'tour-owner-home' : undefined}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
            >
              <Icon name={f.icon} size={18} className={styles.navIcon} />
              <span>{f.name}</span>
            </NavLink>
          ))}
        </div>
      ) : (
        order.map((cat) => {
          const items = enabled.filter((f) => f.category === cat && PM_FEATURE_IDS.has(f.id));
          if (!items.length) return null;
          return (
            <div key={cat}>
              <div className={styles.sectionTitle} style={{ margin: '14px 0 6px', paddingLeft: 8 }}>{cat}</div>
              {items.map((f) => (
                <NavLink
                  key={f.id}
                  to={hrefFor(base, f.route)}
                  data-tour={`tour-${f.id}`}
                  className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
                >
                  <Icon name={f.icon} size={18} className={styles.navIcon} />
                  <span>{f.name}</span>
                </NavLink>
              ))}
            </div>
          );
        })
      )}

      <div className={styles.navSpacer} />
      {onboardingComplete && (
        <button type="button" className={`${styles.navItem} ${styles.navButton}`} onClick={startTour}>
          <Icon name="spark" size={18} className={styles.navIcon} />
          <span>Guided demo tour</span>
        </button>
      )}
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
        <br />
        {syncStatus.mode === 'cloud'
          ? (syncStatus.pending
            ? 'Syncing to cloud…'
            : syncStatus.lastSyncedAt
              ? `Cloud synced · ${new Date(syncStatus.lastSyncedAt).toLocaleTimeString()}`
              : 'Cloud sync ready')
          : 'Saved in this browser · enable cloud sync in Settings'}
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
  const {
    config, features, onboardingComplete, completeOnboarding, featureMap,
    tourOpen, setTourOpen, completeTour, demoRole,
  } = usePm();
  const location = useLocation();
  const enabledIds = new Set(features.filter((f) => f.enabled).map((f) => f.id));
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const defaultTechs = featureMap.maintenance?.config?.technicians || [];
  const gateway = isGatewayPath(location.pathname, config.basePath);

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
            <Route path="features/:slug" element={<FeaturePage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="locations" element={<LocationsIndexPage />} />
            <Route path="locations/:citySlug" element={<LocationPage />} />
            <Route path="roi-calculator" element={<RoiCalculatorPage />} />
            <Route path="owner-home" element={<OwnerHome />} />
            <Route
              path="dashboard"
              element={
                demoRole === 'owner'
                  ? <Navigate to={hrefFor(config.basePath, 'owner-home')} replace />
                  : <Dashboard />
              }
            />
            {features.map((f) => {
              if (!f.route || f.id === 'dashboard') return null;
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

      <FloatingActions />

      {!gateway && (
        <OnboardingWizard
          open={onboardingOpen}
          onClose={() => setOnboardingOpen(false)}
          onComplete={completeOnboarding}
          defaultTechnicians={defaultTechs}
        />
      )}

      {!gateway && (
        <GuidedTour
          open={tourOpen}
          onClose={() => setTourOpen(false)}
          onComplete={completeTour}
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
