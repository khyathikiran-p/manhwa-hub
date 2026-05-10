import Link from "next/link";
import styles from "./Footer.module.css";

/*
 * Footer — site-wide bottom anchor.
 *
 *   Server component (no "use client" needed) — purely static markup.
 *   Tagline keeps the brand voice; links surface About / Browse /
 *   Contact (UX feedback wanted these). Copyright auto-updates each
 *   year via `new Date().getFullYear()` so we don't ship a stale year.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={`${styles.logoText} flameLogo`}>Manhwa Weebs</span>
          <p className={styles.tagline}>
            Discover trending manhwa, manga, and manhua in one place.
          </p>
        </div>

        <nav className={styles.linksColumn} aria-label="Footer">
          <h3 className={styles.linksHeading}>Explore</h3>
          <Link href="/" className={styles.link}>
            Home
          </Link>
          <Link href="/browse" className={styles.link}>
            Browse
          </Link>
          <Link href="/#genres" className={styles.link}>
            Genres
          </Link>
        </nav>

        <nav className={styles.linksColumn} aria-label="Footer secondary">
          <h3 className={styles.linksHeading}>Site</h3>
          <Link href="/about" className={styles.link}>
            About
          </Link>
          <Link href="/contact" className={styles.link}>
            Contact
          </Link>
          <a
            href="https://anilist.co"
            target="_blank"
            rel="noreferrer noopener"
            className={styles.link}
          >
            Powered by AniList
          </a>
        </nav>
      </div>

      <div className={styles.bottom}>
        <span className={styles.copy}>© {year} Manhwa Weebs</span>
        <span className={styles.smallNote}>
          Cover art and metadata © their respective creators &amp; AniList.
        </span>
      </div>
    </footer>
  );
}
