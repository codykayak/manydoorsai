/**
 * Shared "Book a demo" / "Contact us" call-to-action helper.
 *
 * CTAs live in many components (navbar, hero, footer) but the contact form
 * state lives in <FloatingActions>. Rather than thread props through the tree,
 * CTAs dispatch a window event that FloatingActions listens for.
 */

export const OPEN_CONTACT_EVENT = 'manydoors:open-contact';

/**
 * Trigger the primary demo CTA.
 * - If a self-serve scheduling URL is configured, open it in a new tab.
 * - Otherwise, open the on-site contact request widget.
 *
 * @param {string} [bookingUrl] Optional scheduling link (Calendly/Cal.com/etc).
 */
export function requestDemo(bookingUrl) {
  if (bookingUrl) {
    window.open(bookingUrl, '_blank', 'noopener,noreferrer');
    return;
  }
  openContactWidget();
}

/** Open the on-site contact request widget. */
export function openContactWidget() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(OPEN_CONTACT_EVENT));
}
