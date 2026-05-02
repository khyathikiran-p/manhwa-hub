"use client";
import { motion } from "framer-motion";
import styles from "./Pagination.module.css";

export default function Pagination({ currentPage, lastPage, hasNextPage, onPageChange }) {
  // Support both hasNextPage (boolean) and lastPage (number)
  const canGoNext = hasNextPage ?? (lastPage ? currentPage < lastPage : false);
  const totalPages = lastPage || "?";

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <motion.button
        className={styles.pageBtn}
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        ← Prev
      </motion.button>

      <motion.span
        className={styles.pageInfo}
        key={currentPage}
        initial={{ opacity: 0, y: -10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        Page {currentPage} of {totalPages}
      </motion.span>

      <motion.button
        className={styles.pageBtn}
        disabled={!canGoNext}
        onClick={() => onPageChange(currentPage + 1)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        Next →
      </motion.button>
    </nav>
  );
}
