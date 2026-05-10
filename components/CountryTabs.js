"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import styles from "./CountryTabs.module.css";

/*
 * CountryTabs — primary segregation control for Manhwa / Manga / Manhua.
 *
 *   Each tab is the country-of-origin filter that AniList exposes:
 *     KR — Korean (Manhwa)
 *     JP — Japanese (Manga)
 *     CN — Chinese (Manhua)
 *
 *   We surface this as a real visible tab strip rather than a hidden
 *   URL param so users can actually find the segregation. Active tab
 *   uses Framer's `layoutId` so the underline glides between tabs
 *   instead of cutting hard.
 *
 *   The component reads the current `?country=...` from the URL and
 *   writes a new value via router.replace (no scroll). Browse page
 *   already reads `country` from useSearchParams so the grid refreshes
 *   automatically.
 */

const COUNTRY_OPTIONS = [
  {
    code: "KR",
    label: "Manhwa",
    sub: "Korean",
    flag: "🇰🇷",
  },
  {
    code: "JP",
    label: "Manga",
    sub: "Japanese",
    flag: "🇯🇵",
  },
  {
    code: "CN",
    label: "Manhua",
    sub: "Chinese",
    flag: "🇨🇳",
  },
];

export default function CountryTabs({
  className = "",
  preserveQuery = true,
  showLabels = true,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // KR is the default — both for the unfiltered home/browse view and
  // when the URL has no country param.
  const active = searchParams.get("country") || "KR";

  const handleClick = (code) => {
    const params = new URLSearchParams(
      preserveQuery ? Array.from(searchParams.entries()) : []
    );
    if (code === "KR") {
      // Don't clutter the URL with the default
      params.delete("country");
    } else {
      params.set("country", code);
    }
    // Reset page when changing country
    params.delete("page");
    const target = pathname.startsWith("/browse")
      ? "/browse"
      : "/browse";
    const qs = params.toString();
    router.replace(`${target}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  return (
    <div className={`${styles.tabs} ${className}`} role="tablist">
      {COUNTRY_OPTIONS.map((opt) => {
        const isActive = active === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
            onClick={() => handleClick(opt.code)}
            data-cursor="link"
          >
            <span className={styles.flag} aria-hidden="true">
              {opt.flag}
            </span>
            <span className={styles.labelGroup}>
              <span className={styles.label}>{opt.label}</span>
              {showLabels && (
                <span className={styles.sub}>{opt.sub}</span>
              )}
            </span>
            {isActive && (
              <motion.span
                className={styles.glow}
                layoutId="countryTabsGlow"
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
