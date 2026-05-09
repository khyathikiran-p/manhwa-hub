"use client";
import { useEffect, useRef, useState } from "react";
import Tilt from "react-parallax-tilt";
import { useCursorVelocity } from "@/hooks/useCursorVelocity";

/*
 * IntelligentTilt — react-parallax-tilt with cursor-velocity-driven response.
 *
 *   The library exposes static tiltMaxAngle / glareMaxOpacity. We wrap it
 *   so those props are computed live from a velocity MotionValue:
 *     - slow drag        → small tilt, dim glare
 *     - fast pass-over   → wide tilt, bright streaky glare
 *
 *   Why imperative DOM writes? react-parallax-tilt rebuilds its handlers
 *   when its props change, which would create a new pointermove listener on
 *   every velocity tick. Instead we let the library settle on idle defaults
 *   and update its <Tilt>'s root style + a CSS variable that drives an
 *   overlay we render ourselves. Result: zero re-renders during interaction.
 *
 *   The thematic vector ({sharpness, intensity}) tunes:
 *     - max tilt angle   — sharp content tilts wider
 *     - transition speed — sharp = snappier
 *     - glare color      — primary theme color
 */

const DEFAULT_VECTOR = { sharpness: 0.5, intensity: 0.5 };

export default function IntelligentTilt({
  children,
  vector = DEFAULT_VECTOR,
  glareColor = "#ffd166",
  className = "",
  style,
  ...rest
}) {
  const { ref: velocityRef, velocity } = useCursorVelocity();
  const overlayRef = useRef(null);
  const wrapperRef = useRef(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Static, vector-derived config (only changes when content changes)
  const maxTilt = 6 + vector.sharpness * 8; // 6° calm → 14° sharp
  const transitionMs = 800 - vector.sharpness * 400; // 800ms calm → 400ms sharp

  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(m.matches);
    update();
    m.addEventListener?.("change", update);
    return () => m.removeEventListener?.("change", update);
  }, []);

  // Pipe velocity into a CSS var on the overlay — no React renders.
  useEffect(() => {
    const unsub = velocity.on?.("change", (v) => {
      const node = overlayRef.current;
      if (!node) return;
      const norm = Math.min(1, v / 1500);
      // Glare intensity ramps with velocity * intensity vector
      const opacity = 0.04 + norm * 0.45 * (0.6 + vector.intensity * 0.4);
      node.style.setProperty("--tilt-glare-opacity", opacity.toFixed(3));
      // Subtle saturation boost when moving fast
      node.style.setProperty(
        "--tilt-saturate",
        (1 + norm * 0.25 * vector.intensity).toFixed(2)
      );
    });
    return () => unsub?.();
  }, [velocity, vector.intensity]);

  // Combine the velocity-tracking ref with Tilt's wrapper.
  const setWrapperRef = (node) => {
    wrapperRef.current = node;
    velocityRef.current = node;
  };

  if (reduceMotion) {
    return (
      <div className={className} style={style} ref={setWrapperRef}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={style}
      ref={setWrapperRef}
      data-intelligent-tilt
    >
      <Tilt
        tiltMaxAngleX={maxTilt}
        tiltMaxAngleY={maxTilt}
        glareEnable={false} /* we render our own */
        scale={1.025}
        transitionSpeed={transitionMs}
        tiltReverse={false}
        {...rest}
      >
        {children}
        <span
          ref={overlayRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            borderRadius: "inherit",
            background: `linear-gradient(115deg, transparent 30%, ${glareColor} 50%, transparent 70%)`,
            opacity: "var(--tilt-glare-opacity, 0)",
            mixBlendMode: "soft-light",
            filter: "blur(4px) saturate(var(--tilt-saturate, 1))",
            transition: "opacity 180ms ease-out",
          }}
        />
      </Tilt>
    </div>
  );
}
