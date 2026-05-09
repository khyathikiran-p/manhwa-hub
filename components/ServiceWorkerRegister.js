"use client";
import { useEffect } from "react";

/*
 * ServiceWorkerRegister — registers /sw.js on first paint after hydration.
 *
 *   We don't register on mount — we wait for `load` so the SW install
 *   doesn't compete with the LCP image fetch. Cold loads pay nothing;
 *   the shell-cache helps repeat visits.
 *
 *   Skips registration in dev (HMR + service workers fight each other)
 *   and on browsers that don't support SW.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => {
          // Silent fail — SW is a progressive enhancement.
        });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
