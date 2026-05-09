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

// Tuned for "instant feel with just a hint of follow-through" — earlier
// values (stiffness 350) produced a noticeable lag tail that read as sluggish.
const RING_SPRING = { stiffness: 700, damping: 36, mass: 0.45 };
const DOT_SPRING = { stiffness: 1500, damping: 45, mass: 0.4 };

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

  // Skip on touch devices. We require BOTH a fine pointer AND a hover-capable
  // device — Surface/iPad-style hybrids often report `pointer: fine` while
  // also having touch, and a custom cursor on touch causes flicker.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(pointer: fine)");
    const hover = window.matchMedia("(hover: hover)");
    const update = () => {
      const isTouchOnly = navigator.maxTouchPoints > 0 && !hover.matches;
      setEnabled(fine.matches && hover.matches && !isTouchOnly);
    };
    update();
    fine.addEventListener?.("change", update);
    hover.addEventListener?.("change", update);
    return () => {
      fine.removeEventListener?.("change", update);
      hover.removeEventListener?.("change", update);
    };
  }, []);

  // Mark <body> so the CSS module knows when to hide the native cursor.
  // Without this, the native cursor gets stripped on every fine-pointer
  // device, which is wrong for hybrids where we don't render the custom one.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (enabled) document.body.classList.add("has-custom-cursor");
    else document.body.classList.remove("has-custom-cursor");
    return () => document.body.classList.remove("has-custom-cursor");
  }, [enabled]);

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
