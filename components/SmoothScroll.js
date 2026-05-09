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

    const lenis = new Lenis({
      // Heavy, cinematic feel. Lower = slower drift after wheel-stop.
      lerp: 0.085,
      // Easing for programmatic scrollTo() calls
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Native-feeling wheel multiplier — 1 is unmodified
      wheelMultiplier: 1,
      // Touch needs to feel responsive (less momentum than wheel)
      touchMultiplier: 1.4,
      // Don't smooth touch — mobile scroll already feels great natively
      smoothWheel: true,
      smoothTouch: false,
      syncTouch: true,
      // Allow nested scrollables via data-lenis-prevent="true"
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
