"use client";
import { useEffect } from "react";

/*
 * ServiceWorkerRegister — registers /sw.js on first paint after hydration.
 *
 *   We wait for `load` so the SW install doesn't compete with the LCP
 *   image fetch. Cold loads pay nothing; cached responses help repeats.
 *
 *   When a new SW takes over a page that's already running on the old
 *   SW (post-deploy), we listen for `controllerchange` and reload once
 *   so the user immediately sees the latest deploy. Without this hook,
 *   users had to manually refresh twice after every deploy — the first
 *   load served stale cached HTML.
 *
 *   Skips registration in dev (HMR + service workers fight each other).
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    let reloading = false;

    // When the active SW changes, reload the page once so the user gets
    // the new bundle immediately. Guarded so we don't reload-loop if
    // multiple controllerchange events fire in quick succession.
    const onControllerChange = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange
    );

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          // Check for an update on register and ~every 60s while the tab
          // is open, so long-lived sessions pick up new deploys.
          reg.update();
          const t = window.setInterval(() => reg.update(), 60_000);
          return () => window.clearInterval(t);
        })
        .catch(() => {
          // Silent fail — SW is a progressive enhancement.
        });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange
      );
    };
  }, []);

  return null;
}
