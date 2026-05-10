import Link from "next/link";
import { fetchTrendingManhwa, fetchManhwaList } from "@/lib/anilist";
import HeroSection from "@/components/HeroSection";
import ManhwaGrid from "@/components/ManhwaGrid";
import styles from "./home.module.css";

const GENRE_QUICK_NAV = [
  { label: "Action", emoji: "⚔️", genre: "Action" },
  { label: "Fantasy", emoji: "🧙", genre: "Fantasy" },
  { label: "Romance", emoji: "💕", genre: "Romance" },
  { label: "Sci-Fi", emoji: "🚀", genre: "Sci-Fi" },
  { label: "Slice of Life", emoji: "🌸", genre: "Slice of Life" },
  { label: "Horror", emoji: "👻", genre: "Horror" },
  { label: "Thriller", emoji: "🔪", genre: "Thriller" },
  { label: "Comedy", emoji: "😂", genre: "Comedy" },
  { label: "Drama", emoji: "🎭", genre: "Drama" },
  { label: "Mystery", emoji: "🔍", genre: "Mystery" },
  { label: "Adventure", emoji: "🗺️", genre: "Adventure" },
  { label: "Supernatural", emoji: "👁️", genre: "Supernatural" },
];

export default async function HomePage() {
  let trending = [];
  let popular = [];

  try {
    trending = await fetchTrendingManhwa();
  } catch (e) {
    console.error("Failed to fetch trending:", e);
  }

  try {
    const result = await fetchManhwaList({
      perPage: 10,
      sort: "POPULARITY_DESC",
    });
    popular = result.media;
  } catch (e) {
    console.error("Failed to fetch popular:", e);
  }

  return (
    <div className={styles.homePage}>
      {/* Hero */}
      <HeroSection trending={trending} />

      {/* Popular This Season */}
      <section className={styles.featured}>
        <div className={styles.featuredHeader}>
          <h2 className={styles.featuredTitle}>
            🔥 <span>Most Popular</span> Manhwa
          </h2>
          <Link href="/browse" className={styles.viewAll}>
            View All →
          </Link>
        </div>
        <ManhwaGrid manhwas={popular} />
      </section>

      {/* Genre Quick Nav. Anchor `id="genres"` is targeted by the
          navbar's "Genres" link on every route (including this page). */}
      <section id="genres" className={styles.genreNav}>
        <h2 className={styles.genreNavTitle}>
          🎯 Browse by <span>Genre</span>
        </h2>
        <div className={styles.genreGrid}>
          {GENRE_QUICK_NAV.map(({ label, emoji, genre }) => (
            <Link
              key={genre}
              href={`/browse?genres=${encodeURIComponent(genre)}`}
              className={styles.genreCard}
            >
              <span className={styles.genreEmoji}>{emoji}</span>
              {label}
            </Link>
          ))}
          {/* "All Genres" tail link — visually distinct from the chips
              so it reads as a "see more" rather than another filter. */}
          <Link href="/browse" className={styles.genreAllCard}>
            <span>All Genres</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
