import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AmbientStack from "@/components/AmbientStack";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import WebVitalsReporter from "@/components/WebVitalsReporter";

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
  appleWebApp: {
    statusBarStyle: "black-translucent",
  },
};

// Next.js 16: viewport + themeColor are exported separately from metadata.
export const viewport = {
  width: "device-width",
  initialScale: 1,
  // `cover` lets the page extend under the iOS notch / home indicator —
  // without this iOS paints solid black bands above/below that flash
  // during page transitions.
  viewportFit: "cover",
  // Allow up to 5× zoom for accessibility while preventing accidental
  // pinch-zoom mid-swipe.
  maximumScale: 5,
  // Color the iOS / Android URL bar to match the page bg — eliminates
  // the brief white flash mobile users saw during scroll-into-overflow
  // bounces.
  themeColor: "#0a0805",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      {/*
        We previously preconnected to s4.anilist.co and graphql.anilist.co
        but Lighthouse later flagged both as unused — the browser never
        actually opens connections to those hosts:
          - Cover images go through `/_next/image` which proxies to AniList
            from the server, so the browser fetches from our origin only.
          - GraphQL requests are made server-side during ISR/revalidate.
        The preconnect hints just wasted browser connection-pool slots.
      */}
      <body data-scroll-behavior="smooth">
        <ServiceWorkerRegister />
        <WebVitalsReporter />
        <AmbientStack />
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        <main style={{ position: "relative", zIndex: 1 }}>{children}</main>
      </body>
    </html>
  );
}
