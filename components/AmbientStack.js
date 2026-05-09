"use client";
import { useEffect, useState } from "react";
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

  return (
    <>
      <SmoothScroll />
      <AmbientMesh />
      <AmbientBackdrop />
      <ParticleBackground />
      <CustomCursor />
    </>
  );
}
