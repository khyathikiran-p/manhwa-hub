"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import styles from "./CustomCursor.module.css";

/*
 * CustomCursor — desktop-only cursor with mix-blend-mode: difference.
 *
 *   The cursor is *two* layered elements:
 *     - Outer ring: large, soft, lags behind with a heavy spring (≈350ms tail)
 *     - Inner dot: small, snaps tightly (10ms tail), reads as "the actual hit point"
 *
 *   Hover morphing is driven by a mutation/intersection-free hook: a single
 *   pointermove listener walks `e.target.closest('[data-cursor]')` and reads
 *   the cursor variant from a data attribute. This keeps the cost ≈ O(1) per
 *   move event regardless of how many interactive elements exist.
 *
 *   Variants are declared once below. Adding a new cursor state is just
 *   `<MyCard data-cursor="card" data-cursor-label="VIEW" />`.
 *
 *   `mix-blend-mode: difference` inverts colors against whatever's underneath,
 *   so the cursor remains legible on bright covers, dark backgrounds, AND the
 *   orange accent — without ever switching to a contrasting color in JS.
 */

const VARIANTS = {
  default: {
    width: 24,
    height: 24,
    borderRadius: 99,
    scale: 1,
    opacity: 1,
  },
  link: {
    width: 56,
    height: 56,
    borderRadius: 99,
    scale: 1,
    opacity: 1,
  },
  card: {
    width: 88,
    height: 88,
    borderRadius: 99,
    scale: 1,
    opacity: 1,
  },
  text: {
    width: 6,
    height: 32,
    borderRadius: 4,
    scale: 1,
    opacity: 1,
  },
  hidden: {
    width: 24,
    height: 24,
    borderRadius: 99,
    scale: 0,
    opacity: 0,
  },
};

const RING_SPRING = { stiffness: 350, damping: 28, mass: 0.6 };
const DOT_SPRING = { stiffness: 1100, damping: 38, mass: 0.5 };

export default function CustomCursor() {
  const [variant, setVariant] = useState("hidden");
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);

  // Position MotionValues — never touch React on pointermove.
  const xRing = useMotionValue(-100);
  const yRing = useMotionValue(-100);
  const xDot = useMotionValue(-100);
  const yDot = useMotionValue(-100);

  const xRingS = useSpring(xRing, RING_SPRING);
  const yRingS = useSpring(yRing, RING_SPRING);
  const xDotS = useSpring(xDot, DOT_SPRING);
  const yDotS = useSpring(yDot, DOT_SPRING);

  // Don't render on touch devices — `pointer: fine` is the standard signal
  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = window.matchMedia("(pointer: fine)");
    const update = () => setEnabled(m.matches);
    update();
    m.addEventListener?.("change", update);
    return () => m.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e) => {
      // Center the elements on the pointer
      xRing.set(e.clientX);
      yRing.set(e.clientY);
      xDot.set(e.clientX);
      yDot.set(e.clientY);

      // Walk up the tree to find the nearest opt-in element. closest() is
      // optimized in browsers — this is cheap.
      const target = e.target.closest?.("[data-cursor]");
      if (target) {
        const v = target.getAttribute("data-cursor") || "link";
        setVariant(v in VARIANTS ? v : "link");
        setLabel(target.getAttribute("data-cursor-label") || "");
      } else if (variantRef.current !== "default") {
        setVariant("default");
        setLabel("");
      }
    };

    const onLeave = () => setVariant("hidden");
    const onEnter = () => setVariant("default");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerenter", onEnter);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onEnter);
    };
  }, [enabled, xRing, yRing, xDot, yDot]);

  // Track current variant in a ref so we don't re-attach listeners on every
  // setVariant. Avoids the classic "listener re-binds on every state change"
  // performance trap.
  const variantRef = useRef(variant);
  useEffect(() => {
    variantRef.current = variant;
  }, [variant]);

  if (!enabled) return null;

  return (
    <>
      {/* OUTER RING — soft, laggy, blend-difference */}
      <motion.div
        className={styles.ring}
        style={{
          x: xRingS,
          y: yRingS,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={VARIANTS[variant]}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      >
        <AnimatePresence>
          {label && (
            <motion.span
              key={label}
              className={styles.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.18 }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* INNER DOT — tight follow, separate blend layer for contrast */}
      <motion.div
        className={styles.dot}
        style={{
          x: xDotS,
          y: yDotS,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          opacity: variant === "hidden" ? 0 : variant === "card" ? 0 : 1,
          scale: variant === "link" ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 600, damping: 30 }}
      />
    </>
  );
}
