import Link from "next/link";
import styles from "./about.module.css";

export const metadata = {
  title: "About — Manhwa Weebs",
  description:
    "Manhwa Weebs is a community-built directory for discovering Korean manhwa, Japanese manga, and Chinese manhua — built for readers who want a faster, calmer, more immersive way to find their next obsession.",
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <article className={styles.article}>
        <span className={styles.eyebrow}>About</span>
        <h1 className={styles.title}>
          A home for <span className={styles.titleAccent}>manhwa, manga, and manhua</span> fans.
        </h1>
        <p className={styles.lead}>
          Manhwa Weebs is a community-built discovery platform for the world&apos;s
          best Asian comics. We bring together Korean <strong>manhwa</strong>, Japanese{" "}
          <strong>manga</strong>, and Chinese <strong>manhua</strong> in one immersive
          experience — designed for readers who want a faster, calmer, more
          beautiful way to find their next obsession.
        </p>

        <h2 className={styles.sectionTitle}>What you can do here</h2>
        <ul className={styles.list}>
          <li>
            <strong>Discover.</strong> A curated trending hero, browse-by-genre
            shortcuts, and a Most Popular grid pulled from live community ratings.
          </li>
          <li>
            <strong>Search across countries.</strong> One search, three tabs —
            Manhwa / Manga / Manhua — with instant live results and per-title
            details (genres, status, rating, synopsis).
          </li>
          <li>
            <strong>Filter without friction.</strong> Genre, tag, and status filters
            keep their state in the URL so you can share a perfectly-filtered list
            with a friend.
          </li>
          <li>
            <strong>Read on any device.</strong> The interface adapts to your
            screen, your reduced-motion preferences, your data plan, and your
            connection speed — small phones get a calm static layout; desktops
            get the full cinematic treatment.
          </li>
        </ul>

        <h2 className={styles.sectionTitle}>What we believe</h2>
        <p className={styles.body}>
          Comics shouldn&apos;t be hidden behind cluttered, ad-heavy directories.
          Discovery should feel like a recommendation from a trusted friend —
          fast, considered, and visually delightful. Every animation, every
          color shift, every font choice is in service of that.
        </p>

        <h2 className={styles.sectionTitle}>About the data</h2>
        <p className={styles.body}>
          Cover art, synopses, genre tags, and ratings come from{" "}
          <a
            href="https://anilist.co"
            target="_blank"
            rel="noreferrer noopener"
            className={styles.inlineLink}
          >
            AniList
          </a>
          , which sources from the comic creators and publishers themselves. All
          rights to the original works belong to their respective creators and
          publishers. Manhwa Weebs is a fan-built directory — we don&apos;t host any
          chapters or images directly.
        </p>

        <h2 className={styles.sectionTitle}>Who built this</h2>
        <p className={styles.body}>
          A small team of weebs, designers, and engineers who believed the
          discovery experience for Asian comics deserved better. The site is
          open, free forever, and continuously improving — every detail you see
          is the result of community feedback.
        </p>

        <div className={styles.cta}>
          <Link href="/browse" className={styles.ctaPrimary}>
            Start browsing
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
          <Link href="/contact" className={styles.ctaSecondary}>
            Get in touch
          </Link>
        </div>
      </article>
    </div>
  );
}
