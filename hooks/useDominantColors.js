"use client";
import { useEffect, useRef, useState } from "react";

/*
 * useDominantColors — extract a 3-color palette from an image URL.
 *
 * Tradeoffs:
 *   - We avoid `fast-average-color` to skip the dep. The image is loaded
 *     crossOrigin=anonymous, drawn at 32x32 onto an offscreen canvas, and
 *     bucketed by quantized hue. ~2ms per image on a modern laptop.
 *   - Results are cached by URL in a module-level Map so navigating between
 *     cards is free.
 *   - Extraction runs inside requestIdleCallback when available so it never
 *     competes with the slide animation.
 *
 * Returns: { primary, secondary, accent, brightness, ready }
 *   primary/secondary/accent — hex strings
 *   brightness — 0..1, useful for choosing dark/light overlays
 *   ready — false on first paint, true once the palette is computed
 *
 * Usage:
 *   const palette = useDominantColors(item.coverImage?.large, item.coverImage?.color);
 *   useEffect(() => { if (palette.ready) publishTheme(palette); }, [palette]);
 */

const CACHE = new Map();
const SAMPLE_SIZE = 32;

const FALLBACK = {
  primary: "#f59e0b",
  secondary: "#ff8a1f",
  accent: "#ffe066",
  brightness: 0.5,
  ready: false,
};

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function hexFromAniListColor(c) {
  // AniList returns hex like "#aabbcc" — pass through if valid
  if (typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c)) return c;
  return null;
}

function shiftHue(hex, deg) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const s = max === min ? 0 : (max - min) / (1 - Math.abs(2 * l - 1));
  if (max !== min) {
    const d = max - min;
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  h = (h + deg + 360) % 360;
  // hsl -> rgb (mid-lightness preserved)
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let [r2, g2, b2] = [0, 0, 0];
  if (h < 60) [r2, g2, b2] = [c, x, 0];
  else if (h < 120) [r2, g2, b2] = [x, c, 0];
  else if (h < 180) [r2, g2, b2] = [0, c, x];
  else if (h < 240) [r2, g2, b2] = [0, x, c];
  else if (h < 300) [r2, g2, b2] = [x, 0, c];
  else [r2, g2, b2] = [c, 0, x];
  return rgbToHex(
    Math.round((r2 + m) * 255),
    Math.round((g2 + m) * 255),
    Math.round((b2 + m) * 255)
  );
}

// AniList CDN doesn't send CORS headers, so we route through our own proxy
// that re-emits the image with permissive CORS. Other hosts pass through
// unchanged.
const PROXIED_HOSTS = ["s4.anilist.co", "anilistcdn.com", "media.anilist.co"];
function proxyUrl(url) {
  try {
    const parsed = new URL(url);
    if (PROXIED_HOSTS.includes(parsed.host)) {
      return `/api/img?u=${encodeURIComponent(url)}`;
    }
  } catch {
    /* fall through */
  }
  return url;
}

async function extractPalette(url) {
  if (CACHE.has(url)) return CACHE.get(url);

  const palette = await new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";

    // CORS-failed images error out before onload fires. We resolve with null
    // so the caller can keep its hint-based fallback rather than reverting
    // to a hardcoded default.
    img.onerror = () => resolve(null);

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = SAMPLE_SIZE;
        canvas.height = SAMPLE_SIZE;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
        const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

        // Bucket pixels by 30°-wide hue bins, weighted by saturation*lightness.
        const bins = new Array(12).fill(null).map(() => ({
          weight: 0,
          r: 0,
          g: 0,
          b: 0,
        }));
        let lumSum = 0;
        let pixels = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (a < 200) continue;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          lumSum += lum;
          pixels++;

          // Skip near-grayscale + extreme dark/light — they don't carry hue
          if (max - min < 28) continue;
          if (lum < 0.08 || lum > 0.96) continue;

          let h = 0;
          if (max === r) h = ((g - b) / (max - min)) % 6;
          else if (max === g) h = (b - r) / (max - min) + 2;
          else h = (r - g) / (max - min) + 4;
          h = (h * 60 + 360) % 360;

          const sat = (max - min) / max;
          const w = sat * (1 - Math.abs(0.5 - lum) * 1.6);
          const bin = Math.floor(h / 30);
          bins[bin].weight += w;
          bins[bin].r += r * w;
          bins[bin].g += g * w;
          bins[bin].b += b * w;
        }

        const ranked = bins
          .map((b, i) => ({ ...b, i }))
          .filter((b) => b.weight > 0)
          .sort((a, b) => b.weight - a.weight);

        const top = ranked[0];
        const second = ranked[1] || ranked[0];

        const primary = top
          ? rgbToHex(
              Math.round(top.r / top.weight),
              Math.round(top.g / top.weight),
              Math.round(top.b / top.weight)
            )
          : FALLBACK.primary;
        const secondary = second
          ? rgbToHex(
              Math.round(second.r / second.weight),
              Math.round(second.g / second.weight),
              Math.round(second.b / second.weight)
            )
          : shiftHue(primary, 30);
        const accent = shiftHue(primary, 50);
        const brightness = pixels > 0 ? lumSum / pixels : 0.5;

        resolve({
          primary,
          secondary,
          accent,
          brightness,
          ready: true,
        });
      } catch {
        // Canvas tainted (CORS) — bail and let caller keep the hint.
        resolve(null);
      }
    };

    img.src = proxyUrl(url);
  });

  if (palette) CACHE.set(url, palette);
  return palette;
}

export function useDominantColors(url, hintHex = null) {
  const [state, setState] = useState(() => {
    if (url && CACHE.has(url)) return CACHE.get(url);
    const hinted = hexFromAniListColor(hintHex);
    if (hinted) {
      return {
        primary: hinted,
        secondary: shiftHue(hinted, 25),
        accent: shiftHue(hinted, 55),
        brightness: 0.5,
        ready: false, // hint only — real extraction still pending
      };
    }
    return FALLBACK;
  });
  const lastUrl = useRef(null);

  useEffect(() => {
    if (!url || lastUrl.current === url) return;
    lastUrl.current = url;

    let cancelled = false;
    const run = () => {
      extractPalette(url).then((p) => {
        if (cancelled) return;
        // p === null means CORS failed; keep the hint-derived palette but
        // mark it ready so consumers stop waiting.
        if (p) setState(p);
        else setState((prev) => ({ ...prev, ready: true }));
      });
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = window.requestIdleCallback(run, { timeout: 800 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback?.(id);
      };
    }
    const t = setTimeout(run, 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [url]);

  return state;
}
