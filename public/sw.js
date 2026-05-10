/*
 * Manhwa Weebs service worker — minimal offline shell.
 *
 *   Strategy:
 *     - Stale-while-revalidate for `/`, `/browse`, the navbar logo, and
 *       any Next-optimized image (`/_next/image?...`). The user sees a
 *       cached response instantly while the SW fetches a fresh copy in
 *       the background and updates the cache.
 *     - Network-first for HTML elsewhere (manhwa detail pages) — they
 *       have unique URLs and we don't want to serve stale content.
 *     - Static Next.js JS/CSS (`/_next/static/...`) is already
 *       fingerprinted and cached aggressively by Vercel; we let the
 *       browser handle it.
 *
 *   Bump CACHE_VERSION to invalidate the entire cache on the next
 *   visit (e.g. after a deploy with breaking client changes).
 */

// Bumping this string invalidates every previously-cached page on the
// next visit. Bump after any deploy users should not see the cached
// version of (e.g. mobile flicker fixes — a phone holding v1 in cache
// would otherwise show the old broken UI for hours).
const CACHE_VERSION = "mw-v6";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const SHELL_URLS = ["/", "/browse", "/logo-mw.jpeg"];

self.addEventListener("install", (event) => {
  // Pre-cache the shell on first install so the very first repeat
  // visit gets an instant paint even offline.
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .catch(() => {
        // If any pre-cache fails (offline install), we still want the
        // SW to install — runtime caching will fill in later.
      })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Drop old cache versions
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

function isShellRequest(url) {
  return (
    url.pathname === "/" ||
    url.pathname === "/browse" ||
    url.pathname === "/logo-mw.jpeg"
  );
}

function isOptimizedImage(url) {
  return url.pathname === "/_next/image";
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET — ignore mutations, GraphQL POSTs, etc.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip cross-origin (Vercel analytics, etc.) and Next.js dev HMR
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;

  if (isShellRequest(url) || isOptimizedImage(url)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
});

// /_next/image URLs aren't fingerprinted (same URL serves different bytes
// when AniList rotates a cover). We cap their cache at 7 days so users
// don't see permanently stale art.
const IMAGE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  let cached = await cache.match(request);

  // For optimized image responses, age out cached entries beyond 7 days
  // so we don't serve covers that AniList may have updated.
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

  // Always trigger a network update in the background
  const networkFetch = fetch(request)
    .then((response) => {
      if (response && response.status === 200 && response.type === "basic") {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  // Return cached immediately if we have it; otherwise wait for network
  return cached || networkFetch || new Response(null, { status: 504 });
}
