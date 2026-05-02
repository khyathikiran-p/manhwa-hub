"use client";
import { motion } from "framer-motion";
import { SORT_OPTIONS, TROPES } from "@/lib/constants";
import styles from "./SortBar.module.css";

export default function SortBar({
  sort,
  onSortChange,
  total = 0,
  selectedGenres = [],
  selectedTags = [],
  selectedStatus = null,
  onRemoveGenre,
  onRemoveTag,
  onClearStatus,
}) {
  const tropeLabel = (tag) => {
    const found = TROPES.find((t) => t.tag === tag);
    return found ? found.label : tag;
  };

  const statusLabel = (s) => {
    switch (s) {
      case "RELEASING": return "Ongoing";
      case "FINISHED": return "Completed";
      case "HIATUS": return "Hiatus";
      default: return s;
    }
  };

  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <motion.span
          className={styles.resultCount}
          key={total}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <strong>{total.toLocaleString()}</strong> results
        </motion.span>

        <div className={styles.activeFilters}>
          {selectedGenres.map((g) => (
            <motion.button
              key={g}
              className={styles.filterChip}
              onClick={() => onRemoveGenre(g)}
              title={`Remove ${g}`}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              layout
            >
              {g} <span className={styles.removeX}>×</span>
            </motion.button>
          ))}
          {selectedTags.map((t) => (
            <motion.button
              key={t}
              className={styles.filterChip}
              onClick={() => onRemoveTag(t)}
              title={`Remove ${tropeLabel(t)}`}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              layout
            >
              {tropeLabel(t)} <span className={styles.removeX}>×</span>
            </motion.button>
          ))}
          {selectedStatus && (
            <motion.button
              className={styles.filterChip}
              onClick={onClearStatus}
              title="Remove status filter"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              layout
            >
              {statusLabel(selectedStatus)} <span className={styles.removeX}>×</span>
            </motion.button>
          )}
        </div>
      </div>

      <div className={styles.sortWrapper}>
        <select
          className={styles.sortSelect}
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          id="sort-select"
        >
          {SORT_OPTIONS.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <span className={styles.sortArrow}>▼</span>
      </div>
    </div>
  );
}
