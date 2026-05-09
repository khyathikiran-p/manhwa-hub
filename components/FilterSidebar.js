"use client";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GENRES, TROPES, STATUS_OPTIONS } from "@/lib/constants";
import { useRipple } from "@/hooks/useInteractions";
import styles from "./FilterSidebar.module.css";

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.section}>
      <button className={styles.sectionHeader} onClick={() => setOpen(!open)}>
        <span className={styles.sectionTitle}>{title}</span>
        <motion.span
          className={styles.arrow}
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          ▼
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className={styles.sectionBody}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{ overflow: "hidden" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterOption({ label, checked, onChange, type = "checkbox" }) {
  const { ripplesJSX, trigger } = useRipple("rgba(245, 158, 11, 0.3)");

  return (
    <motion.label
      className={`${styles.optionLabel} ${checked ? styles.selected : ""}`}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={trigger}
      style={{ position: "relative", overflow: "hidden" }}
    >
      {ripplesJSX}
      <input
        type={type}
        checked={checked}
        onChange={onChange}
        style={{ position: "relative", zIndex: 1 }}
      />
      {/* Sliding highlight background */}
      {checked && (
        <motion.div
          className={styles.activeHighlight}
          layoutId="filterHighlight"
          initial={false}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
        />
      )}
      <span style={{ position: "relative", zIndex: 1 }}>{label}</span>
    </motion.label>
  );
}

export default function FilterSidebar({
  selectedGenres = [],
  selectedTags = [],
  selectedStatus = null,
  onGenreChange,
  onTagChange,
  onStatusChange,
  onClearAll,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { ripplesJSX: clearRipples, trigger: clearTrigger } = useRipple();

  const totalFilters =
    selectedGenres.length + selectedTags.length + (selectedStatus ? 1 : 0);

  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      onGenreChange(selectedGenres.filter((g) => g !== genre));
    } else {
      onGenreChange([...selectedGenres, genre]);
    }
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      onTagChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagChange([...selectedTags, tag]);
    }
  };

  const sidebarContent = (
    <>
      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarTitle}>Filters</span>
        {totalFilters > 0 && (
          <motion.button
            className={styles.clearBtn}
            onClick={(e) => {
              clearTrigger(e);
              onClearAll();
            }}
            id="clear-filters-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            style={{ position: "relative", overflow: "hidden" }}
          >
            {clearRipples}
            <span style={{ position: "relative", zIndex: 1 }}>
              Clear All ({totalFilters})
            </span>
          </motion.button>
        )}
      </div>

      <FilterSection title="Genres">
        {GENRES.map((genre) => (
          <FilterOption
            key={genre}
            label={genre}
            checked={selectedGenres.includes(genre)}
            onChange={() => toggleGenre(genre)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Tropes & Tags">
        {TROPES.map(({ label, tag }) => (
          <FilterOption
            key={tag}
            label={label}
            checked={selectedTags.includes(tag)}
            onChange={() => toggleTag(tag)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Status">
        {STATUS_OPTIONS.map(({ label, value }) => (
          <FilterOption
            key={label}
            label={label}
            checked={selectedStatus === value}
            onChange={() => onStatusChange(value)}
            type="radio"
          />
        ))}
      </FilterSection>
    </>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <motion.button
        className={styles.mobileToggle}
        onClick={() => setMobileOpen(true)}
        id="filter-toggle"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        🎛️ Filters
        {totalFilters > 0 && (
          <motion.span
            className={styles.filterCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            {totalFilters}
          </motion.span>
        )}
      </motion.button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`}
        id="filter-sidebar"
      >
        <button
          className={styles.closeBtn}
          onClick={() => setMobileOpen(false)}
          aria-label="Close filters"
        >
          ✕
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
