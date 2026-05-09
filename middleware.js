/*
 * Edge middleware — stamps a `Server-Timing` header on every HTML
 * response so we can read it in the Network panel and correlate with
 * the client-side web-vitals beacons.
 *
 *   We can't measure user-side LCP / TBT here (those are client metrics)
 *   but we CAN measure the time the edge spent producing the response,
 *   plus pass through Vercel's region info. That gives us:
 *     - `edge;dur=<ms>;desc="time spent in edge runtime"`
 *     - `region;desc="<vercel region>"`
 *
 *   Combined with the `/api/vitals` ingestion we get a full picture
 *   from "user clicked link" → "TTFB" → "LCP" → "INP".
 *
 *   The matcher excludes static assets and API routes — they don't need
 *   the timing header and skipping them keeps middleware p99 tight.
 */

import { NextResponse } from "next/server";

export const config = {
  matcher: [
    // Apply to navigations + page.js routes; skip _next, api, sw.js, favicon, etc.
    "/((?!api|_next/static|_next/image|favicon.ico|sw.js|logo-mw.jpeg).*)",
  ],
};

export function middleware(request) {
  const start = Date.now();
  const response = NextResponse.next();

  const dur = Date.now() - start;
  const region = process.env.VERCEL_REGION || "local";

  response.headers.set(
    "Server-Timing",
    `edge;dur=${dur};desc="middleware",region;desc="${region}"`
  );

  // Light caching hint for navigations — the client can revalidate
  // asynchronously while serving from cache.
  if (request.headers.get("accept")?.includes("text/html")) {
    // Don't override Next's own Cache-Control on cached pages
    if (!response.headers.has("Cache-Control")) {
      response.headers.set(
        "Cache-Control",
        "public, max-age=0, s-maxage=300, stale-while-revalidate=86400"
      );
    }
  }

  return response;
}
