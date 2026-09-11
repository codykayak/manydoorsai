import { Navigate } from 'react-router-dom';
import { usePm } from '../context/PmContext';

function hrefFor(base, route) {
  const b = (base || '/').replace(/\/$/, '');
  return route ? `${b}/${route}` : b;
}

/** Legacy URL — combined with Savings & ROI page. */
export default function RoiCalculatorPage() {
  const { config } = usePm();
  return <Navigate to={`${hrefFor(config.basePath, 'features/savings')}?view=portfolio`} replace />;
}
