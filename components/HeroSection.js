"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./HeroSection.module.css";

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").trim();
}

const textVariants = {
  enter: { opacity: 0, y: 30, filter: "blur(8px)" },
  center: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -30, filter: "blur(8px)" },
};

export default function HeroSection({ trending = [] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (trending.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % trending.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [trending.length]);

  if (!trending.length) return null;

  const item = trending[current];

  return (
    <section className={styles.hero} id="hero-section">
      {/* Background slides */}
      {trending.map((t, i) => (
        <div
          key={t.id}
          className={`${styles.slide} ${i === current ? styles.active : ""}`}
        >
          {t.bannerImage || t.coverImage?.extraLarge ? (
            <img
              src={t.bannerImage || t.coverImage?.extraLarge}
              alt=""
              className={styles.slideImage}
            />
          ) : (
            <div className={styles.slideImageFallback} />
          )}
          <div className={styles.gradient} />
        </div>
      ))}

      {/* Animated text content */}
      <div className={styles.content}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 200, damping: 22, mass: 0.8 }}
          >
            <motion.span
              className={styles.badge}
              variants={textVariants}
              transition={{ delay: 0.05 }}
            >
              🔥 Trending #{current + 1}
            </motion.span>

            <motion.h1
              className={styles.title}
              variants={textVariants}
              transition={{ delay: 0.1 }}
            >
              {item?.title?.english || item?.title?.romaji || "Unknown"}
            </motion.h1>

            <motion.div
              className={styles.meta}
              variants={textVariants}
              transition={{ delay: 0.15 }}
            >
              {item?.averageScore && (
                <span className={styles.score}>⭐ {item.averageScore}%</span>
              )}
              <div className={styles.genres}>
                {item?.genres?.slice(0, 3).map((g) => (
                  <span key={g} className="chip">{g}</span>
                ))}
              </div>
            </motion.div>

            <motion.p
              className={styles.synopsis}
              variants={textVariants}
              transition={{ delay: 0.2 }}
            >
              {stripHtml(item?.description)}
            </motion.p>

            <motion.div
              className={styles.actions}
              variants={textVariants}
              transition={{ delay: 0.25 }}
            >
              <Link href={`/manhwa/${item?.id}`} className={styles.ctaButton}>
                View Details →
              </Link>
              <Link href="/browse" className={styles.secondaryBtn}>
                Browse All
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={styles.dots}>
        {trending.map((_, i) => (
          <motion.button
            key={i}
            className={`${styles.dot} ${i === current ? styles.activeDot : ""}`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            whileHover={{ scale: 1.4 }}
            whileTap={{ scale: 0.9 }}
            animate={i === current ? { scale: 1.2 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          />
        ))}
      </div>
    </section>
  );
}
