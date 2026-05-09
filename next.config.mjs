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
    imageSizes: [64, 96, 128, 175, 220, 280, 350, 460],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
