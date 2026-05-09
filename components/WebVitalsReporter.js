"use client";
import { useEffect } from "react";

/*
 * WebVitalsReporter — ships Core Web Vitals (CLS, LCP, INP, FCP, TTFB)
 * back to /api/vitals so we get visibility into ACTUAL user metrics
 * instead of relying on Lighthouse synthetic runs.
 *
 *   We use `navigator.sendBeacon` so the request goes out even when the
 *   user closes the tab — fetch() would be cancelled in that flight.
 *
 *   Sampled at 100% for now since traffic is low; add a sampling rate
 *   here once we have real volume.
 */

function send(metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    href: typeof location !== "undefined" ? location.href : "",
    ts: Date.now(),
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/vitals", body);
    return;
  }
  // Fallback for browsers without sendBeacon
  fetch("/api/vitals", {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
    keepalive: true,
  }).catch(() => {});
}

export default function WebVitalsReporter() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (process.env.NODE_ENV !== "production") return;

    let cancelled = false;

    // Dynamic import keeps the 4-5 KiB web-vitals lib out of the
    // initial chunk — it only loads after hydration.
    import("web-vitals").then(({ onCLS, onLCP, onINP, onFCP, onTTFB }) => {
      if (cancelled) return;
      onCLS(send);
      onLCP(send);
      onINP(send);
      onFCP(send);
      onTTFB(send);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
