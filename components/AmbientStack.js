"use client";
import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";

/*
 * AmbientStack — defers all non-critical visual enhancement components.
 *
 *   Tier 1 — `next/dynamic({ ssr: false })`:
 *     Lazy-loads via next/dynamic and disables SSR. Lighthouse measured
 *     ~25 KiB of unused JS in the initial chunk; this drops it.
 *
 *   Tier 2 — gate on first user interaction (this file):
 *     Even after dynamic-import, we hold off mounting until the user
 *     actually does something (scroll / pointermove / touchstart) OR
 *     the browser's been idle for 1500 ms. Cold mobile loads spend
 *     their entire LCP window on the cover image instead of fighting
 *     the canvas + Lenis + magnetic-spring listeners.
 *
 *   Lives in its own client component because next/dynamic({ ssr: false })
 *   can't be called from a Server Component (which app/layout.js is).
 */

const ParticleBackground = dynamic(
  () => import("./ParticleBackground"),
  { ssr: false }
);
const AmbientBackdrop = dynamic(() => import("./AmbientBackdrop"), {
  ssr: false,
});
const AmbientMesh = dynamic(() => import("./AmbientMesh"), { ssr: false });
const SmoothScroll = dynamic(() => import("./SmoothScroll"), { ssr: false });
const CustomCursor = dynamic(() => import("./CustomCursor"), { ssr: false });

export default function AmbientStack() {
  const [activated, setActivated] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const coarse = window.matchMedia("(pointer: coarse)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setIsTouch(coarse.matches || (navigator.maxTouchPoints || 0) > 0);
      setReduceMotion(reduced.matches);
    };
    update();
    coarse.addEventListener?.("change", update);
    reduced.addEventListener?.("change", update);
    return () => {
      coarse.removeEventListener?.("change", update);
      reduced.removeEventListener?.("change", update);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    const activate = () => {
      if (cancelled) return;
      cancelled = true;
      setActivated(true);
    };

    // Idle fallback — if the user is reading and never interacts within
    // 1.5 s, we mount everything so the page still feels "alive".
    const idleId =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(activate, { timeout: 1500 })
        : window.setTimeout(activate, 1500);

    // Any of these signals "the user is here" — flip on the ambience.
    // `{ once: true }` auto-cleans the listeners.
    const events = ["pointerdown", "pointermove", "touchstart", "scroll", "wheel", "keydown"];
    events.forEach((ev) =>
      window.addEventListener(ev, activate, { once: true, passive: true })
    );

    return () => {
      cancelled = true;
      if (typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
      events.forEach((ev) => window.removeEventListener(ev, activate));
    };
  }, []);

  if (!activated) return null;
  if (reduceMotion) return null; // honor system-level pref strictly

  // On touch devices we drop the particle canvas (heaviest rAF loop) and
  // the cursor (no use without a real pointer). The two ambient layers
  // have CSS-level mobile freezes inside their own modules. SmoothScroll
  // already short-circuits when pointer is coarse.
  return (
    <>
      <SmoothScroll />
      <AmbientMesh />
      <AmbientBackdrop />
      {!isTouch && <ParticleBackground />}
      {!isTouch && <CustomCursor />}
    </>
  );
}
