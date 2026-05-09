"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";
import { searchManhwa } from "@/lib/anilist";
import styles from "./SearchOverlay.module.css";

const COUNTRY_OPTIONS = [
  { code: "KR", label: "Manhwa" },
  { code: "JP", label: "Manga" },
  { code: "CN", label: "Manhua" },
];

export default function SearchOverlay({ open, onClose, defaultCountry = "KR" }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState(defaultCountry);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounced = useDebounce(query, 280);

  // Reset/focus when opening
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setCountry(defaultCountry);
      // Focus shortly after the open animation begins
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open, defaultCountry]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Live search
  useEffect(() => {
    let cancelled = false;
    if (!debounced.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    searchManhwa(debounced, { country })
      .then((data) => {
        if (!cancelled) setResults(data || []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced, country]);

  const submit = useCallback(
    (e) => {
      e.preventDefault();
      if (!query.trim()) return;
      const params = new URLSearchParams({ search: query.trim() });
      if (country !== "KR") params.set("country", country);
      router.push(`/browse?${params.toString()}`);
      onClose?.();
    },
    [query, country, router, onClose]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.backdrop}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className={styles.panel}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <form onSubmit={submit} className={styles.searchForm}>
              <span className={styles.iconWrap} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="20" y1="20" x2="16.5" y2="16.5" />
                </svg>
              </span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search manhwa, manga, manhua..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={styles.input}
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
              <button type="button" className={styles.escHint} onClick={onClose} aria-label="Close search">
                ESC
              </button>
            </form>

            <div className={styles.tabs}>
              {COUNTRY_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  className={`${styles.tab} ${country === opt.code ? styles.tabActive : ""}`}
                  onClick={() => setCountry(opt.code)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className={styles.resultsArea}>
              {!debounced.trim() && (
                <div className={styles.empty}>
                  <p>Start typing to search across thousands of titles.</p>
                  <p className={styles.emptyHint}>
                    Press <kbd>Enter</kbd> to view all matches in browse.
                  </p>
                </div>
              )}

              {debounced.trim() && loading && results.length === 0 && (
                <div className={styles.empty}>
                  <div className={styles.spinner} aria-label="Loading" />
                </div>
              )}

              {debounced.trim() && !loading && results.length === 0 && (
                <div className={styles.empty}>
                  <p>No results for &ldquo;{debounced}&rdquo;.</p>
                </div>
              )}

              {results.length > 0 && (
                <ul className={styles.results}>
                  {results.map((m) => {
                    const title =
                      m.title?.english || m.title?.romaji || "Untitled";
                    return (
                      <li key={m.id}>
                        <Link
                          href={`/manhwa/${m.id}`}
                          className={styles.resultRow}
                          onClick={onClose}
                        >
                          <span className={styles.thumb}>
                            {m.coverImage?.large ? (
                              <Image
                                src={m.coverImage.large}
                                alt=""
                                width={50}
                                height={70}
                                sizes="50px"
                                quality={65}
                              />
                            ) : (
                              <span className={styles.thumbFallback} />
                            )}
                          </span>
                          <span className={styles.resultMain}>
                            <span className={styles.resultTitle}>{title}</span>
                            <span className={styles.resultMeta}>
                              {m.averageScore ? (
                                <span className={styles.score}>
                                  ★ {m.averageScore}%
                                </span>
                              ) : null}
                              {(m.genres || []).slice(0, 3).map((g) => (
                                <span key={g} className={styles.genrePill}>
                                  {g}
                                </span>
                              ))}
                            </span>
                          </span>
                          <span className={styles.resultArrow} aria-hidden="true">
                            →
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                  <li>
                    <button
                      type="button"
                      className={styles.viewAll}
                      onClick={(e) => submit(e)}
                    >
                      View all results for &ldquo;{debounced}&rdquo; →
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
