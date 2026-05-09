"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useMagneticSpring } from "@/hooks/useInteractions";
import SearchOverlay from "./SearchOverlay";
import styles from "./Navbar.module.css";

function MagneticTab({ tab, isActive, label }) {
  const { ref, x, y } = useMagneticSpring({ pull: 0.4, radius: 80 });
  return (
    <motion.div
      ref={ref}
      style={{ x, y, position: "relative" }}
      data-cursor="link"
    >
      <Link
        href={tab.href}
        className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
      >
        {tab.label}
        {isActive && (
          <motion.span
            className={styles.tabUnderline}
            layoutId="navTabUnderline"
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          />
        )}
      </Link>
    </motion.div>
  );
}

const TABS = [
  { label: "Manhwa", code: "KR", href: "/" },
  { label: "Manga", code: "JP", href: "/browse?country=JP" },
  { label: "Manhua", code: "CN", href: "/browse?country=CN" },
];

function activeCountry(pathname, searchParams) {
  const country = searchParams?.get("country");
  if (pathname === "/") return "KR";
  if (pathname.startsWith("/browse")) return country || "KR";
  return null;
}

export default function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeCode = activeCountry(pathname, searchParams);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cmd/Ctrl+K opens search
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "/" && !searchOpen) {
        const tag = document.activeElement?.tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA") {
          e.preventDefault();
          setSearchOpen(true);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  return (
    <>
      <motion.nav
        className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
      >
        <div className={styles.inner}>
          {/* Logo */}
          <Link
            href="/"
            className={styles.logo}
            aria-label="MANHWA WEEBS home"
            data-cursor="link"
          >
            <span className={styles.logoMark} aria-hidden="true">
              {/* Manhwa Weebs MW circle mark — vertical orange→red gradient,
                  broken outer ring, stylized MW interior. */}
              <svg viewBox="0 0 100 100" width="38" height="38">
                <defs>
                  <linearGradient id="mw-mark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff9f1a" />
                    <stop offset="55%" stopColor="#ff5a14" />
                    <stop offset="100%" stopColor="#d72e0c" />
                  </linearGradient>
                </defs>

                {/* Broken outer ring — gap at the top + tail flicks */}
                <path
                  d="M 50 6
                     A 44 44 0 1 1 30 11
                     M 50 6
                     A 44 44 0 0 1 92 60
                     M 50 6
                     L 48 16"
                  fill="none"
                  stroke="url(#mw-mark)"
                  strokeWidth="9"
                  strokeLinecap="square"
                />

                {/* Stylized MW letterform — angular, connected uprights */}
                <path
                  d="M 26 76
                     L 26 32
                     L 38 56
                     L 50 32
                     L 50 76
                     M 50 32
                     L 62 56
                     L 74 32
                     L 74 76"
                  fill="none"
                  stroke="url(#mw-mark)"
                  strokeWidth="8"
                  strokeLinejoin="miter"
                  strokeLinecap="square"
                />
              </svg>
            </span>
            <span className={`${styles.logoText} flameLogo`}>
              MANHWA<span className={styles.logoSpace}>&nbsp;</span>WEEBS
            </span>
          </Link>

          {/* Tabs */}
          <div className={styles.tabs}>
            {TABS.map((t) => (
              <MagneticTab
                key={t.code}
                tab={t}
                isActive={activeCode === t.code}
              />
            ))}
          </div>

          {/* Right cluster */}
          <div className={styles.right}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              data-cursor="link"
              data-cursor-label="Search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16.5" y2="16.5" />
              </svg>
            </button>

            <Link
              href="/browse"
              className={styles.avatar}
              aria-label="Profile"
              data-cursor="link"
            >
              <span className={styles.avatarRing}>
                <span className={styles.avatarInner}>
                  <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
                    <defs>
                      <linearGradient id="mw-av" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#ffd166" />
                        <stop offset="100%" stopColor="#ff5e1a" />
                      </linearGradient>
                    </defs>
                    <circle cx="16" cy="12" r="6" fill="url(#mw-av)" />
                    <path d="M4 30c2-7 8-10 12-10s10 3 12 10z" fill="url(#mw-av)" />
                  </svg>
                </span>
              </span>
            </Link>

            <button
              type="button"
              className={styles.hamburger}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <motion.span animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} />
              <motion.span animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }} />
              <motion.span animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className={styles.mobileMenu}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {TABS.map((t) => (
                <Link
                  key={t.code}
                  href={t.href}
                  className={styles.mobileLink}
                  onClick={() => setMobileOpen(false)}
                >
                  {t.label}
                </Link>
              ))}
              <button
                type="button"
                className={styles.mobileLink}
                onClick={() => {
                  setMobileOpen(false);
                  setSearchOpen(true);
                }}
              >
                Search
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        defaultCountry={activeCode || "KR"}
      />
    </>
  );
}
