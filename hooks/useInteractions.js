"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useMotionValue, useSpring } from "framer-motion";

/*
 * useRipple — creates a CSS ripple effect on click.
 * Returns [ripples JSX, triggerRipple handler]
 */
export function useRipple(color = "rgba(245, 158, 11, 0.35)") {
  const [ripples, setRipples] = useState([]);
  const containerRef = useRef(null);

  const trigger = useCallback(
    (e) => {
      const el = containerRef.current || e.currentTarget;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 2;
      const id = Date.now();
      setRipples((prev) => [...prev, { id, x, y, size }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 700);
    },
    []
  );

  const ripplesJSX = (
    <>
      {ripples.map((r) => (
        <span
          key={r.id}
          style={{
            position: "absolute",
            left: r.x - r.size / 2,
            top: r.y - r.size / 2,
            width: r.size,
            height: r.size,
            borderRadius: "50%",
            background: color,
            transform: "scale(0)",
            animation: "rippleExpand 0.7s ease-out forwards",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ))}
    </>
  );

  return { ripplesJSX, trigger, containerRef };
}

/*
 * useMagneticHover — makes an element subtly attract toward the cursor.
 * Returns { style, onMouseMove, onMouseLeave }
 */
export function useMagneticHover(strength = 0.3) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  const onMouseMove = useCallback(
    (e) => {
      const el = ref.current || e.currentTarget;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      setOffset({ x: dx, y: dy });
    },
    [strength]
  );

  const onMouseLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  const style = {
    transform: `translate(${offset.x}px, ${offset.y}px)`,
    transition: offset.x === 0 ? "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)" : "transform 0.1s ease-out",
  };

  return { style, onMouseMove, onMouseLeave, ref };
}

/*
 * useMagneticSpring — Eat-Naked-style magnetic attraction with real spring physics.
 *
 *   Returns { ref, x, y } as Framer MotionValues. Spread them onto a
 *   <motion.div style={{ x, y }}>. The ref attaches to the listening element
 *   (usually the same one), and a small "field of attraction" extends past
 *   the element so the pull engages BEFORE the cursor enters.
 *
 *   Why MotionValues + spring? Magnetic effects feel cheap when they snap
 *   linearly. A real spring with stiffness 220 / damping 22 produces the
 *   bouncy follow-through that reads as physical mass. Critically, this
 *   never enters React's reconciliation — Framer writes transforms directly.
 *
 *   Params:
 *     pull   0..1 — how strongly the element follows the cursor (0.35 ≈ subtle)
 *     radius px    — distance at which attraction starts engaging
 *     spring       — override stiffness/damping/mass for different feel
 */
export function useMagneticSpring({
  pull = 0.35,
  radius = 120,
  spring = { stiffness: 220, damping: 22, mass: 0.8 },
} = {}) {
  const ref = useRef(null);
  const xMV = useMotionValue(0);
  const yMV = useMotionValue(0);
  const x = useSpring(xMV, spring);
  const y = useSpring(yMV, spring);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let inside = false;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      // Field of attraction — engages even slightly outside the element so
      // the cursor "snaps" toward it. Falloff is quadratic so the pull
      // grows fastest right before contact.
      const r = Math.max(rect.width, rect.height) / 2 + radius;
      if (dist > r) {
        if (inside) {
          inside = false;
          xMV.set(0);
          yMV.set(0);
        }
        return;
      }
      inside = true;
      const falloff = 1 - Math.min(1, dist / r);
      const k = pull * falloff * falloff;
      xMV.set(dx * k);
      yMV.set(dy * k);
    };

    const onLeave = () => {
      inside = false;
      xMV.set(0);
      yMV.set(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [pull, radius, xMV, yMV]);

  return { ref, x, y };
}
