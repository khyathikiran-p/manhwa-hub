"use client";
import dynamic from "next/dynamic";

/*
 * AmbientStack — defers all non-critical visual enhancement components.
 *
 *   These run AFTER hydration so the LCP isn't waiting on their JS to
 *   download. Lighthouse measured ~25 KiB of unused JS in the initial
 *   chunk; this wrapper trims it by:
 *     - Lazy-loading via next/dynamic
 *     - Disabling SSR (the components only matter visually post-hydration
 *       and several touch DOM APIs that aren't available server-side)
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
