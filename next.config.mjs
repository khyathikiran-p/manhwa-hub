/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow Next.js Image Optimization to fetch AniList covers and re-emit
  // them as cached WebP / AVIF. Lighthouse measured ~3MB savings on mobile
  // and ~4.5MB on PC by serving these at displayed dimensions.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s4.anilist.co",
        pathname: "/file/**",
      },
      {
        protocol: "https",
        hostname: "anilistcdn.com",
        pathname: "/**",
      },
    ],
    // Match the actual rendered widths in the grid (≈175 / 220 / 350 / 460).
    // Smaller variants → smaller payloads on mobile.
    imageSizes: [16, 32, 48, 64, 96, 128, 175, 220, 280, 350, 460],
    formats: ["image/avif", "image/webp"],
    // Cache transcoded images for 30 days at the CDN edge
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  // Inline the critical CSS that's needed for first paint, defer the rest.
  // Without this, Next emits separate <link rel="stylesheet"> tags that
  // Lighthouse flagged as render-blocking (~150-450ms each on Slow 4G).
  experimental: {
    optimizeCss: true,
    // Tree-shake icon / utility imports from these packages — emits only
    // what's actually used instead of pulling the whole barrel.
    optimizePackageImports: ["framer-motion", "lenis"],
  },

  // Strip console.* from production bundles. Saves a few KiB and prevents
  // log statements from running on the client.
  compiler: {
    removeConsole: { exclude: ["error", "warn"] },
  },
};

export default nextConfig;
