"use client";
import { useEffect, useRef } from "react";
import { motion, useMotionTemplate } from "framer-motion";
import { themeStore } from "@/lib/themeStore";
import styles from "./AmbientMesh.module.css";

/*
 * AmbientMesh — La-Revoltosa-style continuously moving background.
 *
 *   Three layers, all GPU-only:
 *     1. A pair of huge, blurred radial blobs that drift on a slow Lissajous
 *        path. The colors come from themeStore so the mesh tints to match the
 *        active manhwa.
 *     2. A noise SVG layer (feTurbulence -> displacementMap) that animates
 *        slowly via baseFrequency morph — adds organic texture without a
 *        per-frame canvas cost.
 *     3. A grain overlay using a fixed-size dataURI (4kb) that scrolls
 *        infinitely via translate. Pure CSS, no JS.
 *
 *   The grain + turbulence give the page a "paper that's slightly breathing"
 *   feel — never still, but never distracting.
 */

export default function AmbientMesh() {
  const blob1 = useMotionTemplate`radial-gradient(ellipse at 22% 18%, ${themeStore.primary} 0%, transparent 55%)`;
  const blob2 = useMotionTemplate`radial-gradient(ellipse at 78% 75%, ${themeStore.secondary} 0%, transparent 60%)`;
  const blob3 = useMotionTemplate`radial-gradient(ellipse at 50% 95%, ${themeStore.accent} 0%, transparent 50%)`;

  // Drive turbulence baseFrequency via a CSS variable for cheap, GPU-friendly
  // animation. We attach the listener to the SVG element directly so React
  // never re-renders.
  const turbRef = useRef(null);

  useEffect(() => {
    const node = turbRef.current;
    if (!node) return;
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const dt = (t - start) / 1000;
      // 0.012..0.018 — subtle wobble, slow period
      const f = 0.014 + Math.sin(dt * 0.22) * 0.004;
      node.setAttribute("baseFrequency", f.toFixed(4));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={styles.root} aria-hidden="true">
      {/* Layer 1 — drifting color blobs */}
      <motion.div
        className={`${styles.blob} ${styles.blob1}`}
        style={{ background: blob1 }}
      />
      <motion.div
        className={`${styles.blob} ${styles.blob2}`}
        style={{ background: blob2 }}
      />
      <motion.div
        className={`${styles.blob} ${styles.blob3}`}
        style={{ background: blob3 }}
      />

      {/* Layer 2 — turbulence noise via SVG filter */}
      <svg
        className={styles.noise}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <filter id="ambient-noise">
          <feTurbulence
            ref={turbRef}
            type="fractalNoise"
            baseFrequency="0.014"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 0.55 0"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#ambient-noise)" />
      </svg>

      {/* Layer 3 — drifting fine grain */}
      <div className={styles.grain} />
    </div>
  );
}
