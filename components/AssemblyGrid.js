"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { variantsFromTheme, themeVectorFromManhwa } from "@/lib/themeFromManhwa";

/*
 * AssemblyGrid — IO-driven "assembly line" stagger.
 *
 *   Cards aren't all animated together when the page mounts. Each card
 *   is observed individually; it only "unpacks" when its own IntersectionObserver
 *   entry triggers. This keeps the scroll experience continuous — content
 *   stays unpacking as you read further down — and lets thousands of items
 *   coexist without a single giant animation queue.
 *
 *   Per-card variants are derived from that card's own data (themeVectorFromManhwa),
 *   so a row of action manhwa snaps in sharp while a row of slice-of-life
 *   eases in softly. The user feels the genre before reading the title.
 */

function GridItem({ children, manhwa, index, rootRef }) {
  const elRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      {
        root: rootRef?.current ?? null,
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.12,
      }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootRef]);

  // Derive content-aware variants. Memoized via a ref so we recompute only
  // if the manhwa identity changes.
  const variants = useRef(null);
  if (!variants.current || variants.current._id !== manhwa?.id) {
    const vec = themeVectorFromManhwa(manhwa);
    const v = variantsFromTheme(vec, 0);
    v._id = manhwa?.id;
    variants.current = v;
  }

  return (
    <motion.div
      ref={elRef}
      variants={variants.current}
      initial="hidden"
      animate={visible ? "visible" : "hidden"}
      custom={index % 12} /* row-based stagger */
      style={{ willChange: "transform, opacity, filter" }}
    >
      {children}
    </motion.div>
  );
}

export default function AssemblyGrid({
  items = [],
  renderItem,
  className = "",
  scrollRoot,
  getKey = (m) => m.id,
}) {
  return (
    <div className={className}>
      {items.map((m, i) => (
        <GridItem key={getKey(m)} manhwa={m} index={i} rootRef={scrollRoot}>
          {renderItem(m, i)}
        </GridItem>
      ))}
    </div>
  );
}
