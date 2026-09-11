import { useCallback, useState } from 'react';
import Icon from './Icon';
import {
  listInboxItems, addInboxFile, formatFileSize, DEFAULT_INBOX_CONFIG,
} from '../lib/documentInbox';
import styles from '../pm.module.css';
import cc from './commandCenter.module.css';

export default function DocumentInboxDropzone() {
  const [dragOver, setDragOver] = useState(false);
  const [items, setItems] = useState(() => listInboxItems());
  const [uploadMsg, setUploadMsg] = useState(null);

  const handleFiles = useCallback((fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const added = files.map((f) => addInboxFile(f));
    setItems(listInboxItems({ includeMock: false }));
    setUploadMsg(`${added.length} file(s) queued — AI cataloging coming soon`);
    setTimeout(() => setUploadMsg(null), 4000);
  }, []);

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
        <span className={`${styles.badge} ${styles.badgeAmber}`}>Coming soon</span>
      </div>

      <div
        className={`${cc.dropzone} ${dragOver ? cc.dropzoneActive : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <Icon name="upload" size={32} className={cc.dropzoneIcon} />
        <div className={cc.dropzoneTitle}>Drop Yardi exports, rent rolls & A/R PDFs</div>
        <p className={cc.dropzoneCopy}>
          Nightly at <strong>{DEFAULT_INBOX_CONFIG.yardiExportTime}</strong> your Yardi Voyager daily export
          lands here. AI sorts rent rolls, aging reports, and work-order PDFs into the right property folders —
          no manual filing.
        </p>
        <label className={`${styles.btn} ${styles.btnPrimary}`} style={{ marginTop: 12, cursor: 'pointer' }}>
          <Icon name="plus" size={15} />
          Browse files (demo)
          <input
            type="file"
            multiple
            accept=".pdf,.csv,.xlsx,.xls"
            style={{ display: 'none' }}
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
              <span className={`${styles.badge} ${item.status === 'sorted' ? styles.badgeGreen : styles.badgeGray}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
