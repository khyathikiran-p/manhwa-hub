"use client";
import { useEffect } from "react";
import { motion, useMotionTemplate, useTransform } from "framer-motion";
import { themeStore } from "@/lib/themeStore";
import styles from "./AmbientBackdrop.module.css";

/*
 * AmbientBackdrop — fixed-position breathing glow that reflects the active
 * manhwa's palette.
 *
 *   Two soft Gaussian-blurred orbs use radial gradients fed directly from
 *   the themeStore MotionValues via useMotionTemplate. The component itself
 *   never re-renders when the theme changes — Framer pipes the new gradient
 *   string straight to the inline style attribute.
 *
 *   A pulsing "breathing" scale is driven by a separate, GPU-only animation
 *   so the heart-rate stays steady even while the colors morph.
 *
 *   intensity controls the breath cadence (slower for calm content, faster
 *   for action) via a useTransform mapping read inside a useEffect — the only
 *   place where we touch React from this component.
 */

export default function AmbientBackdrop() {
  // Build gradients without React re-rendering. Each character of the
  // template literal is a static splice point; the MotionValues fill the holes.
  const orbA = useMotionTemplate`radial-gradient(circle at 30% 25%, ${themeStore.primary}33 0%, transparent 65%)`;
  const orbB = useMotionTemplate`radial-gradient(circle at 75% 70%, ${themeStore.secondary}29 0%, transparent 60%)`;
  const orbC = useMotionTemplate`radial-gradient(circle at 50% 100%, ${themeStore.accent}1f 0%, transparent 55%)`;

  // Map intensity 0..1 → breath duration 11s..4s. Faster for action, slower for calm.
  const breathDuration = useTransform(
    themeStore.intensity,
    [0, 1],
    [11, 4]
  );

  // Bind the breath duration to a CSS variable on this element only.
  // Reading subscribers inside useEffect avoids hooking into the render path.
  const cssVarRef = (node) => {
    if (!node) return;
    breathDuration.on?.("change", (v) => {
      node.style.setProperty("--breath-duration", `${v.toFixed(2)}s`);
    });
    node.style.setProperty(
      "--breath-duration",
      `${breathDuration.get().toFixed(2)}s`
    );
  };

  return (
    <div className={styles.root} aria-hidden="true" ref={cssVarRef}>
      <motion.div className={`${styles.orb} ${styles.orbA}`} style={{ background: orbA }} />
      <motion.div className={`${styles.orb} ${styles.orbB}`} style={{ background: orbB }} />
      <motion.div className={`${styles.orb} ${styles.orbC}`} style={{ background: orbC }} />
    </div>
  );
}

