/*
 * Manhwa Weebs service worker — minimal offline shell.
 *
 *   Strategy:
 *     - HTML pages (/, /browse): NETWORK-FIRST with cache fallback.
 *       Always tries the network so deploys are visible immediately;
 *       falls back to the cached version only if the network fails
 *       (offline). Earlier we used stale-while-revalidate which kept
 *       showing the old version for one extra refresh after each
 *       deploy — the user reported their laptop "didn't change" after
 *       a fix shipped, exactly because the old HTML was cached.
 *     - /_next/image: STALE-WHILE-REVALIDATE with 7-day age cap. These
 *       aren't fingerprinted but rarely change.
 *     - Logo: STALE-WHILE-REVALIDATE (it's already an immutable asset).
 *     - Static Next.js JS/CSS (`/_next/static/...`) is fingerprinted
 *       and cached aggressively by Vercel; we let the browser handle it.
 *
 *   Bump CACHE_VERSION to invalidate every previous cache entry.
 */

const CACHE_VERSION = "mw-v13";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const SHELL_URLS = ["/logo-mw.jpeg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .catch(() => {})
  );
  // Activate immediately on install — don't wait for tabs to close.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      // Drop every cache that doesn't belong to this version.
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(CACHE_VERSION))
            .map((k) => caches.delete(k))
        )
      ),
      // Take control of all open tabs immediately.
      self.clients.claim(),
    ])
  );
});

function isHtmlPage(url) {
  // App-router HTML routes we want to keep fresh on every visit.
  return (
    url.pathname === "/" ||
    url.pathname === "/browse" ||
    url.pathname === "/about" ||
    url.pathname === "/contact" ||
    url.pathname.startsWith("/manhwa/")
  );
}

function isOptimizedImage(url) {
  return url.pathname === "/_next/image";
}

function isLogo(url) {
  return url.pathname === "/logo-mw.jpeg";
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;
  if (url.pathname.startsWith("/api/")) return;

  if (isHtmlPage(url)) {
    // Network-first so deploys are visible on first refresh, no extra
    // round-trip needed.
    event.respondWith(networkFirst(request));
    return;
  }
  if (isOptimizedImage(url) || isLogo(url)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
});

// /_next/image URLs aren't fingerprinted; cap their cache at 7 days
// so we never serve permanently-stale covers.
const IMAGE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.status === 200 && fresh.type === "basic") {
      // Cache the new response so the next offline load works.
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch {
    // Network failed — fall back to whatever we have cached.
    const cached = await cache.match(request);
    return cached || new Response(null, { status: 504 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  let cached = await cache.match(request);

  if (cached && request.url.includes("/_next/image")) {
    const dateHeader = cached.headers.get("date");
    if (dateHeader) {
      const ageMs = Date.now() - new Date(dateHeader).getTime();
      if (ageMs > IMAGE_MAX_AGE_MS) {
        await cache.delete(request);
        cached = null;
      }
    }
  }

  const networkFetch = fetch(request)
    .then((response) => {
      if (response && response.status === 200 && response.type === "basic") {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  return cached || networkFetch || new Response(null, { status: 504 });
}
