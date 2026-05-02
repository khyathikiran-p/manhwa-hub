"use client";
import { motion } from "framer-motion";
import styles from "./SkeletonCard.module.css";

export default function SkeletonCard({ index = 0 }) {
  return (
    <motion.div
      className={styles.skeleton}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: index * 0.03,
      }}
    >
      <div className={`${styles.image} shimmer`} />
      <div className={styles.info}>
        <div className={`${styles.line} ${styles.titleLine} shimmer`} />
        <div className={`${styles.line} ${styles.chipLine} shimmer`} />
      </div>
    </motion.div>
  );
}
