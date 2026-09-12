import { useEffect, useState } from 'react';
import styles from '../pm.module.css';
import socialStyles from './socialPosts.module.css';
import {
  loadVoiceAgentConfig,
  saveVoiceAgentConfig,
  attachPhoneVoiceLine,
  VOICE_CHOICES,
} from '../lib/voiceAgentAdmin';
import { GROK_VOICE_PHONE_DISPLAY, GROK_VOICE_PHONE_E164 } from '../config/voiceContact';
import { getStoredAdminKey, setStoredAdminKey } from '../lib/socialPostsApi';

export default function VoiceAgentPanel() {
  const [adminKey, setAdminKey] = useState(() => getStoredAdminKey());
  const [greeting, setGreeting] = useState('');
  const [mission, setMission] = useState('');
  const [extraInstructions, setExtraInstructions] = useState('');
  const [voice, setVoice] = useState('aurora');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState('');

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await loadVoiceAgentConfig();
      const c = data.config || {};
      setGreeting(c.greeting || '');
      setMission(c.mission || '');
      setExtraInstructions(c.extraInstructions || '');
      setVoice(c.voice || 'aurora');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (getStoredAdminKey()) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await saveVoiceAgentConfig({ greeting, mission, extraInstructions, voice });
      setToast('Saved. Site Call and the phone line both use this on the next conversation.');
      setTimeout(() => setToast(''), 4000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function attachPhone() {
    setAttaching(true);
    setError(null);
    try {
      const result = await attachPhoneVoiceLine();
      if (result.ok) {
        setToast(`Phone ${GROK_VOICE_PHONE_DISPLAY} now uses the same agent as the website.`);
      } else {
        setError(
          `${result.error || 'Could not auto-attach the number.'} Webhook URL: ${result.webhookUrl || ''}`,
        );
      }
      setTimeout(() => setToast(''), 5000);
    } catch (e) {
      setError(e.message);
    } finally {
      setAttaching(false);
    }
  }

  const webhookUrl =
    'https://us-central1-property-managment-a5ed3.cloudfunctions.net/pmVoiceSipInbound';

  return (
    <div className={socialStyles.socialWrap}>
      {toast && <div className={socialStyles.toast}>{toast}</div>}

      <div className={styles.card}>
        <div className={styles.cardTitle}>Grok voice agent</div>
        <p className={styles.hint} style={{ marginBottom: 12 }}>
          This is the live system prompt (mission) and opening line. Save here, then hit Call on the
          chatbot — no Cursor deploy required for copy tweaks. Uses the same admin key as Social posts.
          Public Grok voice line (temporary):{' '}
          <a href={`tel:${GROK_VOICE_PHONE_E164}`}>{GROK_VOICE_PHONE_DISPLAY}</a>
          . The phone number currently uses a separate xAI console agent — point it at this site
          agent so callers get Aurora, the same greeting, and the same knowledge as website Call.
        </p>
        <div className={styles.field}>
          <label className={styles.label}>Admin API key</label>
          <input
            className={styles.input}
            type="password"
            value={adminKey}
            onChange={(e) => {
              setAdminKey(e.target.value);
              setStoredAdminKey(e.target.value);
            }}
            placeholder="SOCIAL_ADMIN_API_KEY"
          />
        </div>
        <div className={socialStyles.socialActions} style={{ marginTop: 12 }}>
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={refresh} disabled={loading}>
            {loading ? 'Loading…' : 'Load live config'}
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={attachPhone} disabled={attaching || loading}>
            {attaching ? 'Connecting phone…' : 'Use this agent on the phone line'}
          </button>
        </div>
        <p className={styles.hint} style={{ marginTop: 12 }}>
          If auto-connect cannot change the number, in the Grok Voice Agent Builder set{' '}
          {GROK_VOICE_PHONE_DISPLAY} to <strong>webhook</strong> routing and paste{' '}
          <code>{webhookUrl}</code>
        </p>
      </div>

      {error && <p className={styles.hint} style={{ color: '#f85149' }}>{error}</p>}

      <div className={styles.card}>
        <div className={styles.field}>
          <label className={styles.label}>Voice</label>
          <select className={styles.input} value={voice} onChange={(e) => setVoice(e.target.value)}>
            {VOICE_CHOICES.map((v) => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </select>
        </div>
        <div className={styles.field} style={{ marginTop: 14 }}>
          <label className={styles.label}>Opening line (spoken verbatim on Call)</label>
          <textarea
            className={styles.input}
            rows={4}
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
          />
        </div>
        <div className={styles.field} style={{ marginTop: 14 }}>
          <label className={styles.label}>Mission / system prompt</label>
          <textarea
            className={styles.input}
            rows={14}
            value={mission}
            onChange={(e) => setMission(e.target.value)}
          />
        </div>
        <div className={styles.field} style={{ marginTop: 14 }}>
          <label className={styles.label}>Extra notes (optional — appended each call)</label>
          <textarea
            className={styles.input}
            rows={5}
            value={extraInstructions}
            onChange={(e) => setExtraInstructions(e.target.value)}
            placeholder="Today’s demo: lead with maintenance triage for a 280-unit garden community on AppFolio…"
          />
        </div>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnPrimary}`}
          style={{ marginTop: 16 }}
          onClick={save}
          disabled={saving || loading}
        >
          {saving ? 'Saving…' : 'Save and use on next Call'}
        </button>
      </div>
    </div>
  );
}
