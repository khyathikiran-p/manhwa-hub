/*
 * /api/vitals — ingestion endpoint for Core Web Vitals from real users.
 *
 *   For now we just log to stdout (visible in `vercel logs`). When you
 *   want to graph these, the obvious next steps are:
 *     - Pipe to Vercel Analytics (`@vercel/analytics`)
 *     - Forward to Plausible / Umami / a Postgres `vitals` table
 *     - Aggregate by route + device class for a Grafana board
 *
 *   We use the edge runtime so beacons land sub-100 ms regardless of
 *   the user's geography.
 */

export const runtime = "edge";

export async function POST(request) {
  try {
    const data = await request.json();
    // structured log → easier to grep in Vercel logs and feed to a sink
    console.log(
      JSON.stringify({
        type: "web-vital",
        name: data.name,
        value: data.value,
        rating: data.rating,
        href: data.href,
        ts: data.ts,
        ua: request.headers.get("user-agent") || "",
        country: request.headers.get("x-vercel-ip-country") || "",
      })
    );
  } catch {
    // Beacon malformed — ignore silently
  }

  return new Response(null, { status: 204 });
}

// Beacon sender doesn't need a response body, but Next/Vercel sometimes
// preflight-checks the route. Allow OPTIONS so CORS doesn't block it.
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
