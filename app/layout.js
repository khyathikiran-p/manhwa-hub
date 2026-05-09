import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ParticleBackground from "@/components/ParticleBackground";
import AmbientBackdrop from "@/components/AmbientBackdrop";
import AmbientMesh from "@/components/AmbientMesh";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";

const inter = Inter({
  subsets: ["latin"],
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
