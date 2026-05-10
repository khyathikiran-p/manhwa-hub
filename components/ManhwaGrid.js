"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, LayoutGroup } from "framer-motion";
import ManhwaCard from "./ManhwaCard";
import SkeletonCard from "./SkeletonCard";
import styles from "./ManhwaGrid.module.css";

function useIsTouch() {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = window.matchMedia("(pointer: coarse)");
    const update = () =>
      setTouch(m.matches || (navigator.maxTouchPoints || 0) > 0);
    update();
    m.addEventListener?.("change", update);
    return () => m.removeEventListener?.("change", update);
  }, []);
  return touch;
}

export default function ManhwaGrid({
  manhwas = [],
  loading = false,
  error = null,
  onRetry,
}) {
  const isTouch = useIsTouch();
  if (loading) {
    // 24 placeholders matches our `perPage: 24` so the grid never reflows
    // when the real cards arrive — same row count, same column count, just
    // different children. Skeletons share `cardSpring` config (stiffness
    // 300 / damping 25), so the transition from skeleton → real card lands
    // at the exact same final position with no pop.
    return (
      <div className={styles.grid}>
        {Array.from({ length: 24 }).map((_, i) => (
          <SkeletonCard key={`skeleton-${i}`} index={i} />
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

  // On touch devices we render a plain grid — no LayoutGroup, no
  // AnimatePresence. Both of those install pointer event listeners and
  // run layout calculations on every render that on iOS Safari interfere
  // with native scroll. The cards themselves switch to a plain <div>
  // wrapper inside ManhwaCard when isTouch — full visual parity, zero
  // touch interception.
  // First N cards eager-load. Touch users scrolling fast hit the lazy
  // boundary in <1s on a tall phone — they don't have time for the
  // visible-only IntersectionObserver to start fetching. Higher count
  // on touch fixes the perceived "image takes time to load" report.
  // 10 cards on touch = ~5 rows on mobile (2-col grid), so the user can
  // scroll a full screen-and-a-half before hitting any lazy image.
  // 6 cards on desktop = ~1 row of the 5-col grid, since desktop scroll
  // speed is more deliberate and lazy is fine below.
  const eagerCount = isTouch ? 10 : 6;

  if (isTouch) {
    return (
      <div className={styles.grid}>
        {manhwas.map((m, i) => (
          <ManhwaCard
            key={m.id}
            manhwa={m}
            index={i}
            eager={i < eagerCount}
          />
        ))}
      </div>
    );
  }

  return (
    <LayoutGroup>
      <div className={styles.grid}>
        <AnimatePresence mode="popLayout">
          {manhwas.map((m, i) => (
            <ManhwaCard
              key={m.id}
              manhwa={m}
              index={i}
              eager={i < eagerCount}
            />
          ))}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
