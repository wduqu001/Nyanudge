import React, { useState, useCallback } from 'react';
import type { CrashLog } from '../../core/crash/useCrashReporter';
import {
  getCrashLogs,
  clearCrashLogs,
  exportCrashLogs,
  isCrashReporterEnabled,
  setCrashReporterEnabled,
} from '../../core/crash/useCrashReporter';
import styles from './CrashReporterModal.module.css';

interface Props {
  onClose: () => void;
}

export const CrashReporterModal: React.FC<Props> = ({ onClose }) => {
  const [logs, setLogs] = useState<CrashLog[]>(() => getCrashLogs());
  const [enabled, setEnabled] = useState(isCrashReporterEnabled());
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleToggleEnabled = () => {
    const next = !enabled;
    setEnabled(next);
    setCrashReporterEnabled(next);
  };

  const handleClear = () => {
    clearCrashLogs();
    setLogs([]);
  };

  const handleCopyLog = useCallback((log: CrashLog) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Debug Panel">
      <div className={styles.sheet}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.handle} />
          <div className={styles.headerRow}>
            <span className={styles.headerBadge}>🐾 Debug Panel</span>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </div>

        {/* Opt-in toggle */}
        <div className={styles.optInRow}>
          <div>
            <p className={styles.optInLabel}>Local Crash Reporter</p>
            <p className={styles.optInDesc}>
              Stores the last 10 crashes on-device only. No data leaves your phone.
            </p>
          </div>
          <button
            className={`${styles.toggle} ${enabled ? styles.toggleOn : ''}`}
            onClick={handleToggleEnabled}
            role="switch"
            aria-checked={enabled}
            aria-label="Enable crash reporter"
          >
            <span className={styles.toggleThumb} />
          </button>
        </div>

        {/* Log list */}
        <div className={styles.logList}>
          {logs.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>🐱</span>
              <p>
                {enabled
                  ? 'No crash logs recorded.'
                  : 'Enable crash reporter to start capturing errors.'}
              </p>
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className={styles.logCard}>
                <div
                  className={styles.logCardHeader}
                  onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                  role="button"
                  aria-expanded={expandedIndex === i}
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && setExpandedIndex(expandedIndex === i ? null : i)
                  }
                >
                  <div>
                    <p className={styles.logTimestamp}>
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                    <p className={styles.logError}>{log.error}</p>
                  </div>
                  <span className={styles.chevron}>{expandedIndex === i ? '▲' : '▼'}</span>
                </div>

                {expandedIndex === i && (
                  <div className={styles.logExpanded}>
                    {log.componentStack && (
                      <pre className={styles.stackTrace}>{log.componentStack.trim()}</pre>
                    )}
                    {log.stack && <pre className={styles.stackTrace}>{log.stack.trim()}</pre>}
                    <button className={styles.copyBtn} onClick={() => handleCopyLog(log)}>
                      {copied ? '✓ Copied' : 'Copy JSON'}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {logs.length > 0 && (
          <div className={styles.footer}>
            <button className={styles.footerBtn} onClick={exportCrashLogs}>
              ↓ Export JSON
            </button>
            <button
              className={`${styles.footerBtn} ${styles.footerBtnDestructive}`}
              onClick={handleClear}
            >
              Clear Logs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
