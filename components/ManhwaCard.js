"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import styles from "./ManhwaCard.module.css";

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").trim();
}

function getScoreClass(score) {
  if (score >= 75) return styles.scoreHigh;
  if (score >= 50) return styles.scoreMid;
  return styles.scoreLow;
}

function getStatusLabel(status) {
  switch (status) {
    case "RELEASING":
      return { label: "Ongoing", cls: styles.statusOngoing };
    case "FINISHED":
      return { label: "Completed", cls: styles.statusCompleted };
    case "HIATUS":
      return { label: "Hiatus", cls: styles.statusHiatus };
    default:
      return null;
  }
}

// Spring animation config
const cardSpring = {
  type: "spring",
  stiffness: 300,
  damping: 25,
  mass: 0.8,
};

export default function ManhwaCard({ manhwa, index = 0, eager = false }) {
  const title =
    manhwa.title?.english || manhwa.title?.romaji || "Unknown Title";
  const coverUrl =
    manhwa.coverImage?.extraLarge || manhwa.coverImage?.large || "";
  const coverColor = manhwa.coverImage?.color || "#f59e0b";
  const score = manhwa.averageScore;
  const statusInfo = getStatusLabel(manhwa.status);
  const synopsis = stripHtml(manhwa.description);
  const genres = manhwa.genres?.slice(0, 3) || [];

  // react-parallax-tilt attaches pointermove + getBoundingClientRect()
  // listeners on every card. With ~24 cards, that produced the forced
  // reflow Lighthouse measured at 34-38 ms on mobile. The tilt effect is
  // a desktop-only nicety; we skip it entirely on coarse-pointer devices.
  const [enableTilt, setEnableTilt] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(pointer: fine)");
    const hover = window.matchMedia("(hover: hover)");
    const update = () => setEnableTilt(fine.matches && hover.matches);
    update();
    fine.addEventListener?.("change", update);
    hover.addEventListener?.("change", update);
    return () => {
      fine.removeEventListener?.("change", update);
      hover.removeEventListener?.("change", update);
    };
  }, []);

  const cardLink = (
    <Link
      href={`/manhwa/${manhwa.id}`}
      className={styles.card}
      style={{ "--card-glow-color": coverColor }}
    >
          <div className={styles.imageWrapper}>
            {coverUrl && (
              <Image
                src={coverUrl}
                alt={title}
                fill
                sizes="(max-width: 640px) 48vw, (max-width: 1024px) 26vw, 220px"
                className={styles.image}
                /* `eager` flag: rendered for the first 4-6 cards (the
                   ones likely visible above the fold mid-scroll on
                   mobile). Avoids the "scroll halfway, then wait for
                   image" lag the user reported. */
                loading={eager ? "eager" : "lazy"}
                fetchPriority={eager ? "high" : "auto"}
                quality={62}
              />
            )}

            {score && (
              <span
                className={`${styles.scoreBadgeFloat} ${getScoreClass(score)}`}
              >
                ⭐ {score}%
              </span>
            )}

            {statusInfo && (
              <span className={`${styles.statusBadge} ${statusInfo.cls}`}>
                {statusInfo.label}
              </span>
            )}

            {/* Glassmorphism synopsis overlay */}
            <div className={styles.glassOverlay}>
              <div className={styles.glassPanel}>
                <p className={styles.overlaySynopsis}>
                  {synopsis || "No synopsis available."}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.info}>
            <h3 className={styles.title}>{title}</h3>
            {genres.length > 0 && (
              <div className={styles.genreRow}>
                {genres.map((g) => (
                  <span key={g} className={styles.genreChip}>
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>
  );

  // On mobile we strip ALL Framer Motion features from the card —
  // `layout`/`layoutId` cause Framer to call getBoundingClientRect()
  // and write transforms during touch interactions, which on iOS
  // Safari shows up as flickering AND was reportedly absorbing touch
  // events outside the hero. The plain <div> wrapper keeps the same
  // visual layout but lets the browser handle scroll natively.
  if (!enableTilt) {
    return (
      <div style={{ opacity: 1, transform: "none" }}>
        {cardLink}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{
        ...cardSpring,
        delay: index * 0.04,
      }}
      layout
      layoutId={`card-${manhwa.id}`}
    >
      <Tilt
        tiltMaxAngleX={8}
        tiltMaxAngleY={8}
        glareEnable={true}
        glareMaxOpacity={0.12}
        glareColor={coverColor}
        glarePosition="all"
        glareBorderRadius="14px"
        scale={1.03}
        transitionSpeed={800}
        className={styles.tiltWrapper}
      >
        {cardLink}
      </Tilt>
    </motion.div>
  );
}
