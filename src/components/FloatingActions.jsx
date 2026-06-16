import { useState, useEffect } from 'react';
import ContactUsWidget from './ContactUsWidget';
import SiteChatbot from './SiteChatbot';
import { OPEN_CONTACT_EVENT } from '../lib/contactCta';
import fa from './floatingActions.module.css';

/**
 * Bottom-right floating dock: Contact Us pill + AI chatbot.
 * Shown on all property-management routes (gateway + app).
 */
export default function FloatingActions() {
  const [contactOpen, setContactOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const openContact = (open) => {
    setContactOpen(open);
    if (open) setChatOpen(false);
  };

  const openChat = (open) => {
    setChatOpen(open);
    if (open) setContactOpen(false);
  };

  useEffect(() => {
    const handler = () => openContact(true);
    window.addEventListener(OPEN_CONTACT_EVENT, handler);
    return () => window.removeEventListener(OPEN_CONTACT_EVENT, handler);
  }, []);

  return (
    <div className={fa.dock} aria-label="Help and contact">
      <ContactUsWidget open={contactOpen} onOpenChange={openContact} />
      <SiteChatbot open={chatOpen} onOpenChange={openChat} />
    </div>
  );
}
