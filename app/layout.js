import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ParticleBackground from "@/components/ParticleBackground";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "ManhwaHub — Discover Korean Manhwa",
  description:
    "Explore and discover thousands of Korean manhwa (webtoons). Browse by genre, tropes, and ratings. Your ultimate manhwa directory and recommendation engine.",
  keywords: ["manhwa", "webtoon", "korean", "comics", "manga", "action", "fantasy", "romance"],
  openGraph: {
    title: "ManhwaHub — Discover Korean Manhwa",
    description: "Explore and discover thousands of Korean manhwa (webtoons).",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ParticleBackground />
        <Navbar />
        <main style={{ position: "relative", zIndex: 1 }}>{children}</main>
      </body>
    </html>
  );
}
