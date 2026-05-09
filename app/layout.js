import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ParticleBackground from "@/components/ParticleBackground";
import AmbientBackdrop from "@/components/AmbientBackdrop";
import AmbientMesh from "@/components/AmbientMesh";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";

// Only the weights we actually use across the app — Lighthouse flagged the
// previous full-weight load as a render-blocking 1.9s drag on mobile.
//   400 — body copy
//   600 — semibold UI labels
//   700 — bold (sub-headings, badges)
//   800 — extra-bold (titles, primary nav)
//   900 — black (hero title, MANHWA WEEBS logotype)
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "Manhwa Weebs — Discover Manhwa, Manga & Manhua",
  description:
    "Manhwa Weebs is your ultimate hub for discovering manhwa, manga, and manhua. Browse trending titles, search across countries, and find your next obsession.",
  keywords: ["manhwa", "manga", "manhua", "webtoon", "korean comics", "japanese comics", "chinese comics"],
  openGraph: {
    title: "Manhwa Weebs — Discover Manhwa, Manga & Manhua",
    description: "Your ultimate hub for discovering manhwa, manga, and manhua.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preconnect to AniList — Lighthouse measured ~600ms savings on
            mobile by cutting the initial DNS+TLS handshake before the first
            cover request fires. */}
        <link
          rel="preconnect"
          href="https://s4.anilist.co"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://graphql.anilist.co"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://s4.anilist.co" />
        <link rel="dns-prefetch" href="https://graphql.anilist.co" />
      </head>
      <body data-scroll-behavior="smooth">
        <SmoothScroll />
        <AmbientMesh />
        <AmbientBackdrop />
        <ParticleBackground />
        <CustomCursor />
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        <main style={{ position: "relative", zIndex: 1 }}>{children}</main>
      </body>
    </html>
  );
}
