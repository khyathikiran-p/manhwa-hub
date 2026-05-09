"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { useDominantColors } from "@/hooks/useDominantColors";
import { useMagneticSpring } from "@/hooks/useInteractions";
import { publishTheme } from "@/lib/themeStore";
import {
  themeVectorFromManhwa,
  variantsFromTheme,
} from "@/lib/themeFromManhwa";
import HeroAura from "./HeroAura";
import styles from "./HeroSection.module.css";

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").trim();
}

function RatingRing({ score = 0, size = 100 }) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = circumference * (score / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={styles.ratingRing}>
      <defs>
        <linearGradient id="ratingFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#ratingFill)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - filled }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        className={styles.ratingText}
      >
        {Math.round(score)}%
      </text>
    </svg>
  );
}

// Per-element entrance — uses the same variant name keys as the parent
// content variants so inheritance propagates cleanly.
const slideVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -16, filter: "blur(6px)" },
};

export default function HeroSection({ trending = [] }) {
  const [current, setCurrent] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const heroRef = useRef(null);

  const item = trending[current];
  const cover = item?.coverImage?.extraLarge || item?.coverImage?.large || "";

  // ─── Subtle background-only parallax ─────────────────────────────
  // The earlier "fade title on scroll" approach made the hero look broken —
  // users started scrolling and the headline immediately disappeared.
  // We keep just a slow background drift now: it adds depth without ever
  // hiding the foreground content.
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const scrollSmooth = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 22,
    mass: 0.9,
  });
  const bgY = useTransform(scrollSmooth, [0, 1], [0, 90]);
  const bgScale = useTransform(scrollSmooth, [0, 1], [1, 1.05]);

  // Content-aware: extract palette from the active cover, derive vector from
  // genres/tags. Vector flows into auto-rotate cadence and Framer variants.
  const palette = useDominantColors(cover, item?.coverImage?.color);
  const vector = useMemo(() => themeVectorFromManhwa(item), [item]);

  // Publish to global theme store on every focus change. AmbientBackdrop and
  // any other subscribers re-tint without re-rendering this component tree.
  useEffect(() => {
    if (!item) return;
    publishTheme(
      {
        primary: palette.primary,
        secondary: palette.secondary,
        accent: palette.accent,
        intensity: vector.intensity,
        sharpness: vector.sharpness,
        warmth: vector.warmth,
      },
      // Sharper, faster handoff for action; slower for calm content.
      { duration: 1.2 - vector.sharpness * 0.4 }
    );
  }, [item, palette, vector]);

  // Auto-rotation cadence reacts to intensity — action keeps the rhythm tight
  // (5.5s), calm content lingers (9s).
  useEffect(() => {
    if (trending.length === 0) return;
    if (expanded) return;
    const cadence = 9000 - vector.intensity * 3500;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % trending.length);
    }, cadence);
    return () => clearInterval(timer);
  }, [trending.length, expanded, vector.intensity]);

  // Re-derive variants when the content vector changes — memoized object stays
  // referentially stable across renders that don't change the focused item.
  const contentVariants = useMemo(
    () => variantsFromTheme(vector, 0),
    [vector]
  );

  const synopsis = useMemo(() => stripHtml(item?.description), [item]);
  const title = item?.title?.english || item?.title?.romaji || "Untitled";
  const banner = item?.bannerImage || cover;
  const score = item?.averageScore || 0;
  const genres = (item?.genres || []).slice(0, 3);

  if (!trending.length) {
    return (
      <section className={styles.hero}>
        <div className={styles.frame}>
          <div className={styles.empty}>
            <p>Could not load trending titles. Try refreshing.</p>
          </div>
        </div>
      </section>
    );
  }

  const goNext = () => setCurrent((c) => (c + 1) % trending.length);
  const goPrev = () => setCurrent((c) => (c - 1 + trending.length) % trending.length);

  return (
    <section className={styles.hero} ref={heroRef}>
      {/* PREV / NEXT — outside the orange-bordered card on desktop */}
      <button
        className={styles.prevBtn}
        onClick={goPrev}
        aria-label="Previous manhwa"
        data-cursor="link"
        data-cursor-label="Prev"
      >
        <span className={styles.nextCircle}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </span>
      </button>

      <button
        className={styles.nextBtn}
        onClick={goNext}
        aria-label="Next manhwa"
        data-cursor="link"
        data-cursor-label="Next"
      >
        <span className={styles.nextLabel}>Next</span>
        <span className={styles.nextCircle}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </span>
      </button>

      <div className={styles.frame}>
        {/* Glowing border layer */}
        <span className={styles.frameGlow} aria-hidden="true" />

        {/* Background slides — slow parallax layer (deepest depth) */}
        <motion.div
          className={styles.bgWrap}
          style={{ y: bgY, scale: bgScale }}
        >
          {trending.map((t, i) => (
            <div
              key={t.id}
              className={`${styles.slide} ${i === current ? styles.active : ""}`}
            >
              {(t.bannerImage || t.coverImage?.extraLarge) && (
                <img
                  src={t.bannerImage || t.coverImage?.extraLarge}
                  alt=""
                  className={styles.slideImage}
                />
              )}
              <div className={styles.bgVignette} />
              <div className={styles.bgGradient} />
            </div>
          ))}
        </motion.div>

        {/* Live, content-aware flame wisp aura */}
        <HeroAura />

        {/* Content */}
        <div className={styles.content}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              className={styles.slideContent}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={contentVariants}
            >
              {/* Top: Title block */}
              <div className={styles.titleBlock}>
                <motion.div
                  className={styles.titleSub}
                  variants={slideVariants}
                  transition={{ delay: 0.05 }}
                >
                  <span className={styles.subAccent}>Trending #{current + 1}</span>
                  {item?.format && <span className={styles.subDot}>•</span>}
                  {item?.format && <span>{item.format}</span>}
                </motion.div>
                <motion.h1
                  className={styles.title}
                  variants={slideVariants}
                  transition={{ delay: 0.08 }}
                >
                  {title}
                </motion.h1>
                <motion.div
                  variants={slideVariants}
                  transition={{ delay: 0.12 }}
                >
                  <Link
                    href={`/manhwa/${item?.id}`}
                    className={styles.readNow}
                    data-cursor="link"
                    data-cursor-label="Open"
                  >
                    Read Now
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Link>
                </motion.div>
              </div>

              {/* Spacer keeps title up top, bottom panel anchored bottom */}
              <div className={styles.spacer} />

              {/* Bottom panel */}
              <div className={styles.bottomPanel}>
                <motion.div
                  className={styles.selectedBox}
                  variants={slideVariants}
                  transition={{ delay: 0.18 }}
                >
                  <span className={styles.selectedLabel}>Selected Manhwa</span>
                  <div className={styles.selectedRow}>
                    <motion.div
                      layoutId={`cover-${item?.id}`}
                      transition={{
                        type: "spring",
                        stiffness: 240 + vector.sharpness * 200,
                        damping: 28 - vector.sharpness * 6,
                      }}
                    >
                      <Link
                        href={`/manhwa/${item?.id}`}
                        className={styles.coverCard}
                        aria-label={`Open ${title}`}
                        data-cursor="card"
                        data-cursor-label="View"
                      >
                        {cover ? (
                          <img src={cover} alt={title} />
                        ) : (
                          <span className={styles.coverFallback} />
                        )}
                      </Link>
                    </motion.div>
                    <p
                      className={`${styles.synopsis} ${expanded ? styles.synopsisExpanded : ""}`}
                    >
                      {synopsis || "No synopsis available."}
                    </p>
                  </div>

                  <div className={styles.divider} />

                  <div className={styles.genreRow}>
                    {genres.map((g) => (
                      <Link
                        key={g}
                        href={`/browse?genres=${encodeURIComponent(g)}`}
                        className={styles.genrePill}
                        data-cursor="link"
                      >
                        {g}
                      </Link>
                    ))}
                  </div>

                  <button
                    type="button"
                    className={styles.expandLink}
                    onClick={() => setExpanded((v) => !v)}
                  >
                    {expanded ? "Collapse" : "Expand to see more"}
                  </button>
                </motion.div>

                <motion.div
                  className={styles.ratingBox}
                  variants={slideVariants}
                  transition={{ delay: 0.22 }}
                >
                  <RatingRing score={score} />
                  <span className={styles.ratingLabel}>Average Rating:</span>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slide dots */}
          <div className={styles.dots}>
            {trending.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === current ? styles.dotActive : ""}`}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
