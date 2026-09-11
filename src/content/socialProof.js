/**
 * Social-proof content for the gateway homepage.
 *
 * IMPORTANT — keep this honest:
 * - TRUST_SIGNALS are factual product/positioning claims already made across
 *   the site (PMS-agnostic, U.S. support, compliance-aware, continuous updates).
 * - TESTIMONIALS and CLIENT_LOGOS are EMPTY by default on purpose. Do NOT add
 *   fabricated quotes or logos — only paste in REAL pilot/customer proof once
 *   you have permission to use it. The homepage sections render only when these
 *   arrays contain entries, so the page stays clean until real proof exists.
 */

/** Always-on trust strip — factual, non-fabricated positioning signals. */
export const TRUST_SIGNALS = [
  {
    icon: 'grid',
    label: 'Works on your PMS',
    sub: 'Yardi · RealPage · AppFolio · Entrata — no rip-and-replace',
  },
  {
    icon: 'shield',
    label: 'U.S.-based support',
    sub: 'Onboarding & on-call escalation — not an offshore ticket queue',
  },
  {
    icon: 'flag',
    label: 'Compliance-aware',
    sub: 'Fair Housing escalation, TCPA SMS & FCRA screening paths',
  },
  {
    icon: 'refresh',
    label: 'Continuous updates',
    sub: 'New AI models, connectors & guardrails ship regularly',
  },
];

/**
 * Real customer/pilot quotes. EMPTY until you have permission to publish.
 * Shape: { quote, name, title, company, units }
 *
 * Example (replace with a real, approved quote — do not ship the example):
 * {
 *   quote: 'ManyDoors deflected most after-hours resident texts in week one.',
 *   name: 'Jordan Smith',
 *   title: 'VP of Operations',
 *   company: 'Acme Residential',
 *   units: '4,200 units',
 * }
 */
export const TESTIMONIALS = [];

/**
 * Real client logos. EMPTY until you have permission to display them.
 * Shape: { name, src }  (src lives in /public)
 */
export const CLIENT_LOGOS = [];
