"use client";
import { useEffect } from "react";
import Lenis from "lenis";

/*
 * SmoothScroll — Lenis-driven momentum scroll.
 *
 *   Why Lenis?
 *     Native scroll is direct: 1 wheel-tick = 1 distance, no inertia. Awwwards-
 *     class sites feel "heavy" because every scroll has trailing momentum and
 *     a smoothed velocity curve. Lenis intercepts wheel/touch events, applies
 *     a damped target-position lerp each rAF, and writes the result to
 *     window.scroll. This means every Framer `useScroll` hook continues to
 *     work unchanged — they read the same scroll value, only smoother.
 *
 *   Notes:
 *     - We rely on Lenis's hijack of native scroll, NOT the transform-on-wrapper
 *       mode. That keeps `position: fixed` (navbar, cursor) and `position:
 *       sticky` working correctly, and avoids breaking layoutId morphs.
 *     - `prefers-reduced-motion` short-circuits Lenis entirely.
 *     - `lerp` 0.1 is a solid Awwwards default (≈ Lenis's own homepage). Lower =
 *       slower, heavier. Higher = snappier, less cinematic.
 *     - The exposed `data-lenis-prevent` attribute lets nested scrollables
 *       (search overlay results, modals) keep native scroll.
 */

export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;

    // Lenis on touch devices fights the OS scroller — momentum gets doubled,
    // pull-to-refresh gestures break, and Safari's address bar collapse
    // produces visible flicker. Native scroll is excellent on mobile, so we
    // only enable Lenis when there's a fine pointer (mouse / trackpad).
    const isTouch =
      window.matchMedia("(pointer: coarse)").matches ||
      navigator.maxTouchPoints > 0;
    if (isTouch) return;

    const lenis = new Lenis({
      // Heavy-but-responsive. Earlier 0.085 felt floaty; 0.12 reads as a
      // confident "weighted glide" without feeling sluggish.
      lerp: 0.12,
      // Easing for programmatic scrollTo() calls
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      // Touch is gated above, but we still set sensible defaults defensively.
      smoothWheel: true,
      smoothTouch: false,
      syncTouch: false,
      eventsTarget: window,
    });

    let rafId;
    const tick = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    // Expose for debugging / programmatic scroll from app code
    window.lenis = lenis;

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete window.lenis;
    };
  }, []);

  return null;
}
