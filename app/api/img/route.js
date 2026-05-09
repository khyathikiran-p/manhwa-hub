/*
 * /api/img — server-side image proxy for color extraction.
 *
 *   AniList's CDN doesn't send CORS headers, so a browser-side
 *   crossOrigin="anonymous" load fails and taints any canvas drawn from it.
 *   This route fetches the upstream image server-side and re-emits it with
 *   permissive CORS, letting the canvas extractor produce real palettes.
 *
 *   Hardened to AniList only — we don't want this to become an open proxy.
 *   Also long-lived caching since these images never change.
 */

const ALLOWED_HOSTS = new Set([
  "s4.anilist.co",
  "anilistcdn.com",
  "media.anilist.co",
]);

export async function GET(req) {
  const url = new URL(req.url).searchParams.get("u");
  if (!url) return new Response("missing u", { status: 400 });

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return new Response("bad u", { status: 400 });
  }

  if (!ALLOWED_HOSTS.has(parsed.host)) {
    return new Response("host not allowed", { status: 400 });
  }

  const upstream = await fetch(parsed.toString(), {
    headers: { Accept: "image/*" },
    cache: "force-cache",
  });

  if (!upstream.ok) {
    return new Response("upstream " + upstream.status, {
      status: upstream.status,
    });
  }

  const headers = new Headers();
  headers.set(
    "content-type",
    upstream.headers.get("content-type") || "image/jpeg"
  );
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("access-control-allow-origin", "*");
  headers.set("cross-origin-resource-policy", "cross-origin");

  return new Response(upstream.body, { status: 200, headers });
}
