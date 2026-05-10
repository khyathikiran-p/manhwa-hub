import Link from "next/link";
import styles from "./contact.module.css";

export const metadata = {
  title: "Contact — Manhwa Weebs",
  description:
    "Reach out to Manhwa Weebs — feedback, suggestions, partnership, or just say hi. Find us on Instagram @manhwa_weebs.",
};

/*
 * Instagram link — primary contact channel for the brand. Update the
 * handle / URL here if it ever changes; one source of truth.
 */
const INSTAGRAM_URL = "https://www.instagram.com/manhwa_weebs/";
const INSTAGRAM_HANDLE = "@manhwa_weebs";

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <article className={styles.article}>
        <span className={styles.eyebrow}>Contact</span>
        <h1 className={styles.title}>
          Let&apos;s <span className={styles.titleAccent}>talk</span>.
        </h1>
        <p className={styles.lead}>
          Feedback, feature requests, broken cover art, or just want to say hi
          about your favorite manhwa? We read everything.
        </p>

        <div className={styles.channels}>
          {/* Instagram — primary social channel. Big, on-brand, opens in
              a new tab so users don't lose their place. */}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer noopener"
            className={styles.channelCard}
          >
            <span className={styles.channelIcon} aria-hidden="true">
              {/* Instagram glyph — simple SVG, no external icon dep needed */}
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </span>
            <span className={styles.channelMain}>
              <span className={styles.channelLabel}>Instagram</span>
              <span className={styles.channelHandle}>{INSTAGRAM_HANDLE}</span>
              <span className={styles.channelHint}>
                DMs open · trending picks &amp; behind-the-scenes
              </span>
            </span>
            <span className={styles.channelArrow} aria-hidden="true">
              →
            </span>
          </a>

          {/* Email channel — kept private but visible so users know they
              can reach a human. */}
          <a href="mailto:hello@manhwaweebs.com" className={styles.channelCard}>
            <span className={styles.channelIcon} aria-hidden="true">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </span>
            <span className={styles.channelMain}>
              <span className={styles.channelLabel}>Email</span>
              <span className={styles.channelHandle}>hello@manhwaweebs.com</span>
              <span className={styles.channelHint}>
                For business, partnerships, or longer feedback
              </span>
            </span>
            <span className={styles.channelArrow} aria-hidden="true">
              →
            </span>
          </a>
        </div>

        <div className={styles.cta}>
          <Link href="/" className={styles.ctaSecondary}>
            ← Back home
          </Link>
        </div>
      </article>
    </div>
  );
}
