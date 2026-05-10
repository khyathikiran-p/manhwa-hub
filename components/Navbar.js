"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useMagneticSpring } from "@/hooks/useInteractions";
import SearchOverlay from "./SearchOverlay";
import styles from "./Navbar.module.css";

function MagneticTab({ link, isActive }) {
  const { ref, x, y } = useMagneticSpring({ pull: 0.4, radius: 80 });
  return (
    <motion.div
      ref={ref}
      style={{ x, y, position: "relative" }}
      data-cursor="link"
    >
      <Link
        href={link.href}
        className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
        aria-current={isActive ? "page" : undefined}
      >
        {link.label}
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

// Primary navigation — UX feedback wanted Home / Browse / Genres rather
// than the country tabs (which now live inside the Browse filter sidebar
// and the Search overlay's tabs).
const NAV_LINKS = [
  { label: "Home", href: "/", match: (p) => p === "/" },
  {
    label: "Browse",
    href: "/browse",
    match: (p) => p.startsWith("/browse"),
  },
  // The Genre Quick Nav section on the home page has id="genres" so this
  // scrolls there when you're already on the home page; from any other
  // route it routes to /#genres which Next handles natively.
  {
    label: "Genres",
    href: "/#genres",
    match: () => false, // never visually "active" — it's a jump link
  },
];

export default function Navbar() {
  const pathname = usePathname();
  // useSearchParams kept for the SearchOverlay default-country prop.
  const searchParams = useSearchParams();
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeCountry =
    searchParams?.get("country") ||
    (pathname.startsWith("/browse") ? "KR" : "KR");

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
              {/*
                The source file is 787×787 (43 KiB) — much larger than we ever
                render. We declare the *display* width as 38 (desktop)/68 (≤820)
                and let next/image emit responsive WebP/AVIF variants via the
                `/_next/image` optimizer. Result: ~3 KiB instead of 43 KiB,
                served at 1× and 2× DPR for the actual render size.
              */}
              <Image
                src="/logo-mw.jpeg"
                alt="Manhwa Weebs"
                width={38}
                height={38}
                sizes="(max-width: 820px) 68px, 38px"
                quality={70}
                preload
                fetchPriority="high"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </span>
            <span className={`${styles.logoText} flameLogo`}>
              MANHWA<span className={styles.logoSpace}>&nbsp;</span>WEEBS
            </span>
          </Link>

          {/* Primary navigation */}
          <div className={styles.tabs}>
            {NAV_LINKS.map((link) => (
              <MagneticTab
                key={link.href}
                link={link}
                isActive={link.match(pathname)}
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
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={styles.mobileLink}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
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
        defaultCountry={activeCountry}
      />
    </>
  );
}
