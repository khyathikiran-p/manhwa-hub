"use client";
import { useState, useRef, useCallback } from "react";

/*
 * useRipple — creates a CSS ripple effect on click.
 * Returns [ripples JSX, triggerRipple handler]
 */
export function useRipple(color = "rgba(124, 92, 252, 0.35)") {
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
