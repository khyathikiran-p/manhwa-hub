"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useMagneticHover } from "@/hooks/useInteractions";
import styles from "./Navbar.module.css";

function MagneticLink({ href, children, isActive, onClick }) {
  const magnetic = useMagneticHover(0.25);

  return (
    <Link
      href={href}
      className={`${styles.link} ${isActive ? styles.active : ""}`}
      onClick={onClick}
      onMouseMove={magnetic.onMouseMove}
      onMouseLeave={magnetic.onMouseLeave}
      ref={magnetic.ref}
      style={magnetic.style}
    >
      {children}
      {isActive && (
        <motion.div
          className={styles.activeIndicator}
          layoutId="navIndicator"
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        />
      )}
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/browse?search=${encodeURIComponent(search.trim())}`);
      setMobileOpen(false);
    }
  };

  return (
    <motion.nav
      className={styles.nav}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
    >
      <Link href="/" className={styles.logo}>
        <motion.span
          className={styles.logoIcon}
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          📖
        </motion.span>
        <span className={styles.logoText}>ManhwaHub</span>
      </Link>

      <div className={styles.links}>
        <MagneticLink href="/" isActive={pathname === "/"}>
          Home
        </MagneticLink>
        <MagneticLink
          href="/browse"
          isActive={pathname.startsWith("/browse")}
        >
          Browse
        </MagneticLink>
        <MagneticLink
          href="/tutorials"
          isActive={pathname.startsWith("/tutorials")}
        >
          Tutorials
        </MagneticLink>
      </div>

      <form onSubmit={handleSearch} className={styles.searchWrapper}>
        <motion.div
          className={styles.searchGlow}
          animate={{
            opacity: searchFocused ? 1 : 0,
            scale: searchFocused ? 1 : 0.8,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Search manhwa..."
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          id="desktop-search"
        />
      </form>

      <button
        className={styles.hamburger}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
        id="mobile-menu-toggle"
      >
        <motion.span
          animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        />
        <motion.span
          animate={mobileOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        />
        <motion.span
          animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          >
            <Link
              href="/"
              className={styles.link}
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/browse"
              className={styles.link}
              onClick={() => setMobileOpen(false)}
            >
              Browse
            </Link>
            <Link
              href="/tutorials"
              className={styles.link}
              onClick={() => setMobileOpen(false)}
            >
              Tutorials
            </Link>
            <form onSubmit={handleSearch} className={styles.mobileSearchWrapper}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Search manhwa..."
                className={styles.mobileSearch}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="mobile-search"
              />
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
