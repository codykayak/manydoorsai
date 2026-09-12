import { useCallback, useState } from 'react';
import { usePm } from '../context/PmContext';
import Icon from './Icon';
import {
  listInboxItems, formatFileSize, DEFAULT_INBOX_CONFIG,
} from '../lib/documentInbox';
import styles from '../pm.module.css';
import cc from './commandCenter.module.css';

export default function DocumentInboxDropzone() {
  const { importPortfolioFiles, portfolioSynced } = usePm();
  const [dragOver, setDragOver] = useState(false);
  const [items, setItems] = useState(() => listInboxItems());
  const [uploadMsg, setUploadMsg] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback(async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setProcessing(true);
    setUploadMsg(null);
    try {
      const { results, snapshot } = await importPortfolioFiles(files, { source: 'manual-drop' });
      setItems(listInboxItems());
      const ok = results.filter((r) => r.ok && !r.skipped);
      const failed = results.filter((r) => !r.ok);
      if (snapshot) {
        setUploadMsg(`Imported ${ok.length} file(s) — ${snapshot.summaryText}`);
      } else if (failed.length) {
        setUploadMsg(`Import failed: ${failed[0].error}`);
      } else {
        setUploadMsg(`${files.length} file(s) cataloged`);
      }
    } catch (err) {
      setUploadMsg(err.message || 'Import failed');
    } finally {
      setProcessing(false);
      setTimeout(() => setUploadMsg(null), 6000);
    }
  }, [importPortfolioFiles]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer?.files);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.cardTitle}>
          <Icon name="upload" size={16} className={cc.cyanIcon} />
          Document inbox
        </span>
        {portfolioSynced
          ? <span className={`${styles.badge} ${styles.badgeGreen}`}>Rent roll synced</span>
          : <span className={`${styles.badge} ${styles.badgeBlue}`}>Drop to import</span>}
      </div>

      <div
        className={`${cc.dropzone} ${dragOver ? cc.dropzoneActive : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <Icon name="upload" size={32} className={cc.dropzoneIcon} />
        <div className={cc.dropzoneTitle}>Drop Yardi / PMS exports & rent rolls</div>
        <p className={cc.dropzoneCopy}>
          Nightly at <strong>{DEFAULT_INBOX_CONFIG.yardiExportTime}</strong> your PMS daily export
          can auto-upload via the sync listener (Settings → PMS nightly sync). CSV and Excel rent rolls
          update vacancy, residents, and the owner portfolio immediately.
        </p>
        <label className={`${styles.btn} ${styles.btnPrimary}`} style={{ marginTop: 12, cursor: 'pointer' }}>
          <Icon name="plus" size={15} />
          {processing ? 'Processing…' : 'Browse files'}
          <input
            type="file"
            multiple
            accept=".pdf,.csv,.xlsx,.xls,.xlsm"
            style={{ display: 'none' }}
            disabled={processing}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
        {uploadMsg && <div className={cc.uploadMsg}>{uploadMsg}</div>}
      </div>

      {items.length > 0 && (
        <div className={cc.inboxList}>
          <div className={styles.sectionTitle} style={{ marginTop: 16 }}>Recent documents</div>
          {items.slice(0, 5).map((item) => (
            <div key={item.id} className={cc.inboxRow}>
              <Icon name="doc" size={16} className={cc.cyanIcon} />
              <div className={cc.inboxMeta}>
                <div className={cc.inboxName}>{item.fileName}</div>
                <div className={styles.hint}>
                  {item.category || 'Pending classification'}
                  {item.summary ? ` · ${item.summary}` : ''}
                  {' · '}{formatFileSize(item.sizeBytes)}
                </div>
              </div>
              <span className={`${styles.badge} ${
                item.status === 'sorted' ? styles.badgeGreen
                  : item.status === 'error' ? styles.badgeRed
                    : item.status === 'processing' ? styles.badgeAmber
                      : styles.badgeGray
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
