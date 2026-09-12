import { useMemo, useState } from 'react';
import { LineChart, GroupedBar } from './charts/Charts';
import { DEFAULT_PROPERTY_PROFILE } from '../lib/propertyProfile';
import gw from '../pages/gateway.module.css';

function computeSavings(units, calls, apps, maintenance) {
  const staffCostPerCall = 4.5;
  const aiCostPerCall = 0.35;
  const missedCallRate = 0.12;
  const appConversionLift = 0.08;
  const avgRent = 1650;
  const maintenanceMinutesSaved = 12;

  const callSavings = calls * (staffCostPerCall - aiCostPerCall);
  const recoveredLeases = apps * missedCallRate * appConversionLift;
  const leaseRevenue = recoveredLeases * avgRent;
  const maintenanceSavings = maintenance * (maintenanceMinutesSaved / 60) * 42;
  const platformFee = units * 2.5;
  const netMonthly = callSavings + leaseRevenue + maintenanceSavings - platformFee;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthly = months.map((label, i) => {
    const season = 1 + (i >= 4 && i <= 8 ? 0.15 : 0);
    return {
      label,
      savings: Math.round(netMonthly * season),
      apps: Math.round(apps * season),
      maintenance: Math.round(maintenance * season),
      staffCost: Math.round(calls * staffCostPerCall * season),
      aiCost: Math.round(calls * aiCostPerCall * season + platformFee),
    };
  });

  return { callSavings, leaseRevenue, maintenanceSavings, platformFee, netMonthly, monthly };
}

const TABS = [
  { id: 'calculator', label: 'Calculator' },
  { id: 'monthly', label: 'Monthly trend' },
  { id: 'annual', label: 'Cost comparison' },
];

export default function SavingsCalculator({ initialProfile }) {
  const base = initialProfile || DEFAULT_PROPERTY_PROFILE;
  const [tab, setTab] = useState('calculator');
  const [units, setUnits] = useState(base.unitCount || 120);
  const [calls, setCalls] = useState(base.estimatedMonthlyCalls || 450);
  const [apps, setApps] = useState(base.estimatedAppsPerMonth || 35);
  const [maintenance, setMaintenance] = useState(base.estimatedMaintenanceCallsPerMonth || 180);

  const model = useMemo(
    () => computeSavings(Number(units) || 0, Number(calls) || 0, Number(apps) || 0, Number(maintenance) || 0),
    [units, calls, apps, maintenance],
  );

  return (
    <div className={gw.savingsCalc}>
      <div className={gw.savingsTabs} role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`${gw.savingsTab} ${tab === t.id ? gw.savingsTabActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'calculator' && (
        <div className={gw.savingsCalcGrid}>
          <div className={gw.savingsInputs}>
            <label className={gw.savingsField}>
              <span>Number of units</span>
              <input type="number" min="0" value={units} onChange={(e) => setUnits(e.target.value)} />
            </label>
            <label className={gw.savingsField}>
              <span>Estimated calls / month</span>
              <input type="number" min="0" value={calls} onChange={(e) => setCalls(e.target.value)} />
            </label>
            <label className={gw.savingsField}>
              <span>Rental applications / month</span>
              <input type="number" min="0" value={apps} onChange={(e) => setApps(e.target.value)} />
            </label>
            <label className={gw.savingsField}>
              <span>Maintenance calls / month</span>
              <input type="number" min="0" value={maintenance} onChange={(e) => setMaintenance(e.target.value)} />
            </label>
          </div>
          <div className={gw.savingsResults}>
            <p className={gw.savingsNet}>
              ${Math.round(model.netMonthly).toLocaleString()}
              <span>/ mo est. net</span>
            </p>
            <div className={gw.savingsBreakdown}>
              <div><span>Call handling</span><strong>${Math.round(model.callSavings).toLocaleString()}</strong></div>
              <div><span>Leasing lift</span><strong>${Math.round(model.leaseRevenue).toLocaleString()}</strong></div>
              <div><span>Maintenance efficiency</span><strong>${Math.round(model.maintenanceSavings).toLocaleString()}</strong></div>
              <div><span>Platform</span><strong className={gw.savingsNeg}>-${Math.round(model.platformFee).toLocaleString()}</strong></div>
            </div>
            <p className={gw.savingsDisclaimer}>
              Illustrative model — adjust inputs to match your community. Not a guarantee of savings.
            </p>
          </div>
        </div>
      )}

      {tab === 'monthly' && (
        <div className={gw.chartCard}>
          <LineChart
            labels={model.monthly.map((m) => m.label)}
            series={[
              { label: 'Net savings', points: model.monthly.map((m) => m.savings), color: '#00d2d3' },
              { label: 'Applications', points: model.monthly.map((m) => m.apps), color: '#a371f7' },
              { label: 'Maintenance calls', points: model.monthly.map((m) => m.maintenance), color: '#d29922' },
            ]}
            height={280}
            formatY={(v) => `$${Math.round(v / 1000)}k`}
          />
        </div>
      )}

      {tab === 'annual' && (
        <div className={gw.chartCard}>
          <GroupedBar
            labels={model.monthly.map((m) => m.label)}
            series={[
              { label: 'Traditional staffing', values: model.monthly.map((m) => m.staffCost), color: '#64748b' },
              { label: 'ManyDoors AI', values: model.monthly.map((m) => m.aiCost), color: '#00d2d3' },
            ]}
            height={280}
            formatY={(v) => `$${Math.round(v / 1000)}k`}
          />
        </div>
      )}
    </div>
  );
}
