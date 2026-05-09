"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

/*
 * ParallaxLayer — wrap children in a depth-aware scroll-linked transform.
 *
 *   Why two-stage scroll spring? We map the raw scroll progress (linear) to
 *   a translateY range, THEN run that through a spring. The result is that
 *   each layer "drifts" with the scroll instead of locking to it 1:1 — the
 *   D&D effect, where backgrounds feel like they have weight and lag.
 *
 *   `depth`:
 *     0 = no movement (foreground)
 *     1 = matches scroll exactly
 *     >1 = moves faster than scroll (deep foreground / slides out faster)
 *     <0 = moves opposite to scroll (sky-far background)
 *
 *   `range` is the px shift over the element's offset-scroll. Defaults
 *   produce a subtle, premium feel — bump higher for dramatic reveals.
 */

export default function ParallaxLayer({
  children,
  depth = 0.4,
  range = 160,
  className = "",
  style,
  spring = { stiffness: 90, damping: 24, mass: 1 },
  offset = ["start end", "end start"],
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset });

  // 0..1 → -range*depth .. +range*depth
  // Negative depth flips the direction.
  const yRaw = useTransform(
    scrollYProgress,
    [0, 1],
    [range * depth, -range * depth]
  );
  const y = useSpring(yRaw, spring);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ ...style, y, willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}
