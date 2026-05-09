"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import IntelligentTilt from "./IntelligentTilt";
import { themeVectorFromManhwa } from "@/lib/themeFromManhwa";
import { useDominantColors } from "@/hooks/useDominantColors";
import { publishTheme } from "@/lib/themeStore";
import styles from "./DynamicManhwaCard.module.css";

/*
 * DynamicManhwaCard — content-aware card with hover-driven theme handoff.
 *
 *   Architecture:
 *     - Hovering the card publishes its palette to the global themeStore,
 *       so the AmbientBackdrop and any other subscribers shift to match.
 *       Mouse-out reverts to the previously-focused theme via the caller's
 *       restoreTheme prop (e.g. the hero's currently-active title).
 *
 *     - layoutId={`card-${id}`} lets a card morph into the hero or detail
 *       view's cover. When the user clicks through, the framework's shared
 *       layout transition slides the card image into place.
 *
 *     - The image's color hint comes from AniList (coverImage.color) — used
 *       as the immediate fallback while the canvas extractor runs in idle.
 */

export default function DynamicManhwaCard({
  manhwa,
  restoreTheme = null,
  priority = false,
}) {
  const cover =
    manhwa.coverImage?.extraLarge ||
    manhwa.coverImage?.large ||
    manhwa.coverImage?.medium ||
    "";
  const title = manhwa.title?.english || manhwa.title?.romaji || "Untitled";
  const palette = useDominantColors(cover, manhwa.coverImage?.color);
  const vector = themeVectorFromManhwa(manhwa);
  const score = manhwa.averageScore;

  const onHoverStart = () => {
    if (!palette.ready && !palette.primary) return;
    publishTheme(
      { ...palette, ...vector },
      // Sharper handoff for "intense" content — feels reactive to hover.
      { duration: 0.55 - vector.sharpness * 0.25 }
    );
  };

  const onHoverEnd = () => {
    if (restoreTheme) publishTheme(restoreTheme, { duration: 0.6 });
  };

  return (
    <motion.div
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className={styles.cardOuter}
      style={{
        // Static CSS vars seeded from the AniList hint — the canvas extractor
        // will refine these once it runs without re-rendering React.
        "--card-primary": palette.primary,
        "--card-secondary": palette.secondary,
        "--card-accent": palette.accent,
      }}
    >
      <IntelligentTilt
        vector={vector}
        glareColor={palette.accent}
        className={styles.tiltShell}
      >
        <Link
          href={`/manhwa/${manhwa.id}`}
          className={styles.card}
          aria-label={title}
        >
          {/* layoutId enables hero ↔ card morph */}
          <motion.div
            layoutId={`cover-${manhwa.id}`}
            className={styles.imageWrap}
            transition={{
              type: "spring",
              stiffness: 240 + vector.sharpness * 200,
              damping: 28 - vector.sharpness * 6,
              mass: 0.85,
            }}
          >
            {cover ? (
              <img
                src={cover}
                alt={title}
                className={styles.image}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
              />
            ) : (
              <div className={styles.imageFallback} />
            )}

            {/* Per-card glow uses the extracted palette */}
            <span className={styles.glow} aria-hidden="true" />

            {score ? (
              <span className={styles.score}>★ {score}%</span>
            ) : null}
          </motion.div>

          <div className={styles.body}>
            <motion.h3
              layoutId={`title-${manhwa.id}`}
              className={styles.title}
            >
              {title}
            </motion.h3>
            {manhwa.genres?.length > 0 && (
              <div className={styles.genres}>
                {manhwa.genres.slice(0, 3).map((g) => (
                  <span key={g} className={styles.genre}>
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>
      </IntelligentTilt>
    </motion.div>
  );
}
