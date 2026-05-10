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
          {/* Instagram — primary social channel for the brand. opens in
              a new tab so users don't lose their place mid-browse. */}
          <a
            href="https://www.instagram.com/manhwa_weebs/"
            target="_blank"
            rel="noreferrer noopener"
            className={styles.linkSocial}
            aria-label="Manhwa Weebs on Instagram"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            Instagram
          </a>
        </nav>
      </div>

      <div className={styles.bottom}>
        <span className={styles.copy}>© {year} Manhwa Weebs</span>
        <span className={styles.smallNote}>
          Cover art and metadata © their respective creators.
        </span>
      </div>
    </footer>
  );
}
