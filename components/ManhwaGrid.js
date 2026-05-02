"use client";
import { AnimatePresence, LayoutGroup } from "framer-motion";
import ManhwaCard from "./ManhwaCard";
import SkeletonCard from "./SkeletonCard";
import styles from "./ManhwaGrid.module.css";

export default function ManhwaGrid({
  manhwas = [],
  loading = false,
  error = null,
  onRetry,
}) {
  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 15 }).map((_, i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.grid}>
        <div className={styles.errorBox}>
          <span className={styles.errorIcon}>⚠️</span>
          <p className={styles.errorMsg}>{error}</p>
          {onRetry && (
            <button className={styles.retryBtn} onClick={onRetry} id="retry-btn">
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (manhwas.length === 0) {
    return (
      <div className={styles.grid}>
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📭</span>
          <h3 className={styles.emptyTitle}>No manhwa found</h3>
          <p className={styles.emptyDesc}>
            Try adjusting your filters or search terms to discover more titles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <LayoutGroup>
      <div className={styles.grid}>
        <AnimatePresence mode="popLayout">
          {manhwas.map((m, i) => (
            <ManhwaCard key={m.id} manhwa={m} index={i} />
          ))}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
