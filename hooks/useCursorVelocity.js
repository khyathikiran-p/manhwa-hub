"use client";
import { useEffect, useRef } from "react";
import { motionValue, useMotionValue } from "framer-motion";

/*
 * useCursorVelocity — tracks pointer velocity on a target element.
 *
 *   We expose the velocity as a MotionValue so consumers like
 *   <IntelligentTilt /> can transform it (clamp, smooth, map to glare opacity)
 *   without ever entering React's reconciliation. A single rAF loop runs only
 *   while the pointer is over the target.
 *
 * Usage:
 *   const { ref, velocity } = useCursorVelocity();
 *   const glareOpacity = useTransform(velocity, [0, 1500], [0.05, 0.45]);
 *   return <div ref={ref}><motion.div style={{ opacity: glareOpacity }} /></div>;
 *
 * Design note:
 *   We compute pixels-per-second (capped at 2000) using a 3-frame rolling
 *   average to smooth out hand jitter. Decay-when-idle is built in so the
 *   value naturally returns to 0 — no need for callers to reset.
 */

const SMOOTHING = 0.35; // EMA factor — lower = smoother
const IDLE_DECAY = 0.92; // per-frame multiplier when pointer is idle
const MAX_VELOCITY = 2000;

export function useCursorVelocity() {
  const ref = useRef(null);
  const velocityMV = useMotionValue(0);
  const last = useRef({ x: 0, y: 0, t: 0 });
  const rafId = useRef(0);
  const idle = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tick = () => {
      if (idle.current) {
        const v = velocityMV.get() * IDLE_DECAY;
        velocityMV.set(v < 0.5 ? 0 : v);
        if (v >= 0.5) {
          rafId.current = requestAnimationFrame(tick);
        } else {
          rafId.current = 0;
        }
        return;
      }
      idle.current = true;
      rafId.current = requestAnimationFrame(tick);
    };

    const onPointerMove = (e) => {
      const t = performance.now();
      const dt = t - (last.current.t || t);
      if (dt <= 0) {
        last.current = { x: e.clientX, y: e.clientY, t };
        return;
      }
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      const speed = Math.min(MAX_VELOCITY, (Math.hypot(dx, dy) / dt) * 1000);
      const smoothed =
        velocityMV.get() * (1 - SMOOTHING) + speed * SMOOTHING;
      velocityMV.set(smoothed);
      last.current = { x: e.clientX, y: e.clientY, t };
      idle.current = false;
      if (!rafId.current) rafId.current = requestAnimationFrame(tick);
    };

    const onPointerLeave = () => {
      idle.current = true;
      if (!rafId.current) rafId.current = requestAnimationFrame(tick);
    };

    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerleave", onPointerLeave);
    return () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onPointerLeave);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [velocityMV]);

  return { ref, velocity: velocityMV };
}

// Shared singleton for global cursor velocity (used by ambient particles).
export const globalCursorVelocity = motionValue(0);
