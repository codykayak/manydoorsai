import { useCallback, useEffect, useState } from 'react';
import styles from '../pm.module.css';
import socialStyles from './socialPosts.module.css';
import {
  approveSocialPost,
  copyPostBundle,
  generateSocialPost,
  getSocialConfig,
  getStoredAdminKey,
  listSocialPosts,
  markSocialPostPosted,
  rejectSocialPost,
  setStoredAdminKey,
  updateSocialCaptions,
  updateSocialConfig,
} from '../lib/socialPostsApi';

const PLATFORMS = [
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'x', label: 'X' },
];

function statusClass(status) {
  if (status === 'approved') return socialStyles.statusApproved;
  if (status === 'posted') return socialStyles.statusPosted;
  if (status === 'rejected') return socialStyles.statusRejected;
  return socialStyles.statusPending;
}

function PostCard({ post, onRefresh }) {
  const [platform, setPlatform] = useState('facebook');
  const [caption, setCaption] = useState(post[platform]?.caption || '');
  const [saving, setSaving] = useState(false);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    setCaption(post[platform]?.caption || '');
  }, [platform, post]);

  const p = post[platform] || {};
  const charLimit = platform === 'x' ? 280 : 2200;

  async function saveCaption() {
    setSaving(true);
    try {
      await updateSocialCaptions(post.id, { [platform]: { caption } });
      onRefresh();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function doAction(fn) {
    setActing(true);
    try {
      await fn(post.id);
      onRefresh();
    } catch (e) {
      alert(e.message);
    } finally {
      setActing(false);
    }
  }

  function copyCaption() {
    const text = copyPostBundle({ ...post, [platform]: { ...p, caption } }, platform);
    navigator.clipboard?.writeText(text);
  }

  return (
    <article className={socialStyles.postCard}>
      <div className={socialStyles.postCardHead}>
        <div>
          <div className={socialStyles.postDate}>{post.date}</div>
          <div className={socialStyles.postTopic}>{post.topic?.title}</div>
          {post.sourceArticle?.url && (
            <a
              className={socialStyles.articleLink}
              href={post.sourceArticle.url}
              target="_blank"
              rel="noreferrer"
            >
              Source: {post.sourceArticle.title?.slice(0, 70)}
              {post.sourceArticle.title?.length > 70 ? '…' : ''}
            </a>
          )}
        </div>
        <span className={`${socialStyles.statusBadge} ${statusClass(post.status)}`}>
          {(post.status || 'pending_review').replace('_', ' ')}
        </span>
      </div>

      <div className={socialStyles.platformTabs}>
        {PLATFORMS.map((pl) => (
          <button
            key={pl.id}
            type="button"
            className={platform === pl.id ? socialStyles.platformTabActive : socialStyles.platformTab}
            onClick={() => setPlatform(pl.id)}
          >
            {pl.label}
          </button>
        ))}
      </div>

      <div className={socialStyles.postBody}>
        <div className={socialStyles.imagePreview}>
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={`${platform} preview`} />
          ) : (
            <div className={socialStyles.imagePlaceholder}>No image generated</div>
          )}
        </div>

        <div className={socialStyles.captionArea}>
          <label className={socialStyles.captionLabel}>Caption — ready to paste</label>
          <textarea
            className={socialStyles.captionTextarea}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
          <div className={socialStyles.charCount}>
            {caption.length} / {charLimit} chars
          </div>
          <div className={socialStyles.socialActions}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSm} ${styles.btnGhost}`}
              onClick={copyCaption}
            >
              Copy caption
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSm} ${styles.btnPrimary}`}
              disabled={saving}
              onClick={saveCaption}
            >
              {saving ? 'Saving…' : 'Save edits'}
            </button>
          </div>
        </div>
      </div>

      <div className={socialStyles.postFooter}>
        {post.status === 'pending_review' && (
          <>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSm} ${styles.btnPrimary}`}
              disabled={acting}
              onClick={() => doAction(approveSocialPost)}
            >
              Approve
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSm} ${styles.btnGhost}`}
              disabled={acting}
              onClick={() => doAction(rejectSocialPost)}
            >
              Reject
            </button>
          </>
        )}
        {(post.status === 'approved' || post.status === 'pending_review') && (
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSm} ${styles.btnPrimary}`}
            disabled={acting}
            onClick={() => doAction(markSocialPostPosted)}
          >
            Mark as posted
          </button>
        )}
      </div>

      {post.errors?.length > 0 && (
        <div className={socialStyles.errorBanner} style={{ margin: '0 18px 18px' }}>
          Partial errors: {post.errors.join(' · ')}
        </div>
      )}
    </article>
  );
}

export default function SocialPostsPanel() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [adminKey, setAdminKey] = useState(getStoredAdminKey());
  const [config, setConfig] = useState(null);
  const [notifyPhone, setNotifyPhone] = useState('');
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [showSettings, setShowSettings] = useState(!getStoredAdminKey());

  const refresh = useCallback(async () => {
    if (!getStoredAdminKey()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [listRes, configRes] = await Promise.all([
        listSocialPosts(30),
        getSocialConfig(),
      ]);
      setPosts(listRes.posts || []);
      setConfig(configRes.config);
      setNotifyPhone(configRes.config?.notifyPhone || '');
      setNotifyEnabled(configRes.config?.notifyEnabled !== false);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function saveKey() {
    setStoredAdminKey(adminKey.trim());
    setShowSettings(false);
    refresh();
  }

  async function handleGenerate(force = false) {
    setGenerating(true);
    setError('');
    try {
      await generateSocialPost(force);
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveConfig() {
    setSavingConfig(true);
    try {
      await updateSocialConfig({
        notifyPhone,
        notifyEnabled,
      });
      await refresh();
      alert('Notification settings saved.');
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingConfig(false);
    }
  }

  return (
    <div className={socialStyles.socialWrap}>
      <div className={socialStyles.socialHeader}>
        <div>
          <strong>Daily social factory</strong>
          <p className={styles.hint} style={{ marginTop: 4 }}>
            AI picks a topic, finds industry news, writes FB/IG/X captions, generates NanoBanana images.
            You get a text to your phone every morning — review and post here.
          </p>
        </div>
        <div className={socialStyles.socialActions}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
            onClick={() => setShowSettings((v) => !v)}
          >
            Settings
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
            disabled={generating || !adminKey}
            onClick={() => handleGenerate(true)}
            title="Overwrite today's bundle"
          >
            Regenerate
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
            disabled={generating || !adminKey}
            onClick={() => handleGenerate(false)}
          >
            {generating ? (
              <>
                <span className={socialStyles.spinner} />
                Generating…
              </>
            ) : (
              'Generate today'
            )}
          </button>
        </div>
      </div>

      {(showSettings || !adminKey) && (
        <div className={socialStyles.settingsCard}>
          <div className={styles.cardTitle}>Connection & notifications</div>
          <div className={socialStyles.settingsGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Social Admin API key</label>
              <input
                className={styles.input}
                type="password"
                placeholder="Set SOCIAL_ADMIN_API_KEY in Firebase secrets"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>SMS notify phone (E.164)</label>
              <input
                className={styles.input}
                placeholder="+15413212630"
                value={notifyPhone}
                onChange={(e) => setNotifyPhone(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.rowWrap} style={{ marginTop: 12, alignItems: 'center' }}>
            <span className={styles.hint}>Daily SMS when posts are ready</span>
            <div
              className={`${styles.toggle} ${notifyEnabled ? styles.toggleOn : ''}`}
              onClick={() => setNotifyEnabled((v) => !v)}
              role="switch"
              aria-checked={notifyEnabled}
            >
              <span className={styles.toggleKnob} />
            </div>
          </div>
          <div className={socialStyles.socialActions} style={{ marginTop: 14 }}>
            <button type="button" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`} onClick={saveKey}>
              Save API key
            </button>
            {adminKey && (
              <button
                type="button"
                className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
                disabled={savingConfig}
                onClick={handleSaveConfig}
              >
                {savingConfig ? 'Saving…' : 'Save notification settings'}
              </button>
            )}
          </div>
          <p className={socialStyles.setupNote}>
            Firebase secrets needed: <code>GEMINI_API_KEY</code>, <code>SOCIAL_ADMIN_API_KEY</code>,{' '}
            <code>TWILIO_ACCOUNT_SID</code>, <code>TWILIO_AUTH_TOKEN</code>, <code>TWILIO_FROM_NUMBER</code>.
            Scheduler runs daily at 7:00 AM Pacific. See knowledge base article &quot;Social posts&quot; for setup.
          </p>
        </div>
      )}

      {error && <div className={socialStyles.errorBanner}>{error}</div>}

      {loading && (
        <div className={socialStyles.emptyState}>
          <span className={socialStyles.spinner} />
          Loading posts…
        </div>
      )}

      {!loading && !error && posts.length === 0 && adminKey && (
        <div className={socialStyles.emptyState}>
          <p>No posts yet. Hit <strong>Generate today</strong> to create your first bundle.</p>
          <p className={styles.hint} style={{ marginTop: 8 }}>
            Or wait for the 7 AM Pacific scheduler — you&apos;ll get a text when it&apos;s ready.
          </p>
        </div>
      )}

      {!loading && posts.map((post) => (
        <PostCard key={post.id} post={post} onRefresh={refresh} />
      ))}

      {config && posts.length > 0 && (
        <p className={styles.hint}>
          Scheduler: daily 7:00 AM PT · Notify: {config.notifyEnabled ? config.notifyPhone : 'off'}
        </p>
      )}
    </div>
  );
}
