import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { usePm } from '../context/PmContext';
import Icon from './Icon';
import { requestDemo } from '../lib/contactCta';
import nav from './gatewayNavbar.module.css';

function hrefFor(base, route) {
  const b = (base || '/').replace(/\/$/, '') || '/';
  if (!route) return b === '/' ? '/' : b;
  if (b === '/') return `/${route}`;
  return `${b}/${route}`;
}

function pathEndsWith(pathname, suffix) {
  const normalized = pathname.replace(/\/$/, '') || '/';
  const target = suffix.startsWith('/') ? suffix : `/${suffix}`;
  return normalized === target || normalized.endsWith(target);
}

const FEATURE_NAV = [
  { route: 'features/communications', label: 'AI Resident', icon: 'chat' },
  { route: 'features/leasing', label: 'Automated Leasing', icon: 'key' },
  { route: 'features/maintenance', label: 'Maintenance', icon: 'wrench' },
];

const SAVINGS_ROUTE = 'features/savings';

/**
 * Top navigation for gateway marketing pages.
 * Logo links to the original marketing homepage.
 */
export default function GatewayNavbar({ onEnter, homeTo }) {
  const { config } = usePm();
  const navigate = useNavigate();
  const location = useLocation();
  const base = config.basePath;
  const homeHref = homeTo || hrefFor(base, '');
  const savingsHref = hrefFor(base, SAVINGS_ROUTE);
  const savingsActive = pathEndsWith(location.pathname, SAVINGS_ROUTE)
    || pathEndsWith(location.pathname, 'roi-calculator');

  const enter = onEnter || (() => navigate(hrefFor(base, 'dashboard')));

  return (
    <header className={nav.bar}>
      <div className={nav.inner}>
        <NavLink to={homeHref} end className={nav.brand} aria-label={`${config.productName} home`}>
          <img
            src={config.logoMenu || config.logoWordmark || config.logo}
            alt={config.productName}
            className={nav.menuLogo}
          />
        </NavLink>

        <nav className={nav.links} aria-label="Product features">
          {FEATURE_NAV.map((item) => (
            <NavLink
              key={item.route}
              to={hrefFor(base, item.route)}
              className={({ isActive }) => `${nav.link} ${isActive ? nav.linkActive : ''}`}
            >
              <Icon name={item.icon} size={16} />
              <span className={nav.linkLabel}>{item.label}</span>
            </NavLink>
          ))}
          <NavLink
            to={savingsHref}
            className={`${nav.link} ${savingsActive ? nav.linkActive : ''}`}
          >
            <Icon name="dollar" size={16} />
            <span className={nav.linkLabel}>Savings &amp; ROI</span>
          </NavLink>
          <NavLink
            to={hrefFor(base, 'pros')}
            className={({ isActive }) => `${nav.link} ${isActive ? nav.linkActive : ''}`}
          >
            <Icon name="spark" size={16} />
            <span className={nav.linkLabel}>Pros</span>
          </NavLink>
        </nav>

        <div className={nav.actions}>
          <button
            type="button"
            className={nav.bookBtn}
            onClick={() => requestDemo(config.bookingUrl)}
          >
            <span className={nav.bookLabel}>Demo</span>
            <Icon name="calendar" size={16} />
          </button>
          <button type="button" className={nav.enterBtn} onClick={enter}>
            <span className={nav.enterLabel}>Enter</span>
            <Icon name="bolt" size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
