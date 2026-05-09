"use client";
import { motionValue, animate } from "framer-motion";

/*
 * themeStore — a singleton holder for the *active* manhwa's visual identity.
 *
 * Why MotionValues (not React state)?
 *   Theme changes happen on every slide rotation, hover preview, and detail
 *   transition. If we held this in React state, every consumer would
 *   re-render on each shift. MotionValues update via direct DOM/GPU writes
 *   (`useMotionTemplate`, style-binding), so the React tree stays still.
 *
 *   Subscribers: bind these MotionValues with useMotionTemplate / style={...}.
 *   Publishers: call publishTheme() whenever the focused manhwa changes.
 */

export const themeStore = {
  // Hex strings — animated as colors via framer's color interpolator.
  primary: motionValue("#f59e0b"),
  secondary: motionValue("#ff8a1f"),
  accent: motionValue("#ffe066"),

  // Scalars in [0..1] driving glow size, particle speed, blur radius, etc.
  intensity: motionValue(0.5), // overall energy (action/horror = high)
  sharpness: motionValue(0.5), // transition snappiness (overpowered = high)
  warmth: motionValue(0.5), // hue temperature (romance warm, sci-fi cool)
};

const DEFAULT_DURATION = 1.1;
const DEFAULT_EASE = [0.22, 1, 0.36, 1]; // expo-out — feels organic

/**
 * Smoothly transition the global theme to a new manhwa's identity.
 * Called from any component that "owns the focus" (hero rotator, hover preview, detail page).
 *
 * @param {object} theme
 * @param {string} theme.primary       Dominant hex color.
 * @param {string} theme.secondary     Secondary hex color.
 * @param {string} [theme.accent]      Highlight hex color.
 * @param {number} [theme.intensity]   0..1 — slide rotation speed, glow scale.
 * @param {number} [theme.sharpness]   0..1 — spring stiffness multiplier.
 * @param {number} [theme.warmth]      0..1 — temperature for ambient blend.
 * @param {object} [opts]              Override duration/ease.
 */
export function publishTheme(theme, opts = {}) {
  const duration = opts.duration ?? DEFAULT_DURATION;
  const ease = opts.ease ?? DEFAULT_EASE;

  if (theme.primary)
    animate(themeStore.primary, theme.primary, { duration, ease });
  if (theme.secondary)
    animate(themeStore.secondary, theme.secondary, { duration, ease });
  if (theme.accent)
    animate(themeStore.accent, theme.accent, { duration, ease });
  if (typeof theme.intensity === "number")
    animate(themeStore.intensity, theme.intensity, { duration, ease });
  if (typeof theme.sharpness === "number")
    animate(themeStore.sharpness, theme.sharpness, { duration, ease });
  if (typeof theme.warmth === "number")
    animate(themeStore.warmth, theme.warmth, { duration, ease });
}
