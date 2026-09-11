import { backdropForPage } from '../content/pageBackgrounds';
import gw from '../pages/gateway.module.css';

/**
 * Full-page decorative backdrop for standalone marketing pages.
 * @param {{ page: 'overview'|'savings'|'faq'|'pros'|'features' }} props
 */
export default function PageBackdrop({ page }) {
  const src = backdropForPage(page);
  if (!src) return null;

  return (
    <div className={gw.pageBackdrop} aria-hidden="true">
      <img src={src} alt="" className={gw.pageBackdropImg} loading="lazy" decoding="async" />
      <div className={gw.pageBackdropScrim} />
    </div>
  );
}
