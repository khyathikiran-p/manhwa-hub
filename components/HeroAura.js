"use client";
import { useEffect, useRef } from "react";
import { themeStore } from "@/lib/themeStore";
import styles from "./HeroAura.module.css";

/*
 * HeroAura — canvas particle system that paints "flame wisps" rising
 * around the active manhwa cover, colored from its extracted palette.
 *
 *   - Particles spawn near the bottom edges and drift upward with a sinusoidal
 *     swirl so they trail like fire/wind, similar to the gold wisps in the
 *     Sandmancer mockup.
 *   - Live colors come from themeStore.primary / .accent — when a new title
 *     is focused, in-flight particles fade out using their old color and
 *     new ones spawn in the new color, so transitions feel atmospheric.
 *   - Density scales with intensity: action manhwa get more sparks, calm
 *     content gets a thinner, lazier mist.
 *   - Uses 'lighter' compositing for additive bloom on top of the cover.
 *
 * This component only re-renders if mounted/unmounted; all updates flow
 * through the canvas + MotionValue subscriptions.
 */

const MAX_PARTICLES = 80;

class Wisp {
  constructor(rect) {
    this.spawn(rect);
  }
  spawn(rect, color = "#ffb53d") {
    // Spawn from the bottom 20% of the canvas, biased to either side
    const side = Math.random() < 0.5 ? -1 : 1;
    const xBias = side < 0 ? 0.15 : 0.85;
    const xJitter = (Math.random() - 0.5) * 0.25;
    this.x = (xBias + xJitter) * rect.width;
    this.y = rect.height + 10;

    // Upward drift, slight inward curl
    this.vy = -(0.4 + Math.random() * 1.1);
    this.vx = -side * (0.05 + Math.random() * 0.25);

    // Sinusoidal swirl drives a wispy trail
    this.swirlPhase = Math.random() * Math.PI * 2;
    this.swirlSpeed = 0.018 + Math.random() * 0.02;
    this.swirlAmp = 0.18 + Math.random() * 0.4;

    this.size = 18 + Math.random() * 38;
    this.maxLife = 140 + Math.random() * 120;
    this.age = 0;
    this.color = color;
    this.alive = true;
  }
  update(dt, intensitySpeed) {
    this.age += dt;
    if (this.age >= this.maxLife) {
      this.alive = false;
      return;
    }
    this.swirlPhase += this.swirlSpeed * dt;
    const lateral = Math.sin(this.swirlPhase) * this.swirlAmp;
    this.x += (this.vx + lateral) * intensitySpeed;
    this.y += this.vy * intensitySpeed;
  }
  draw(ctx) {
    const t = this.age / this.maxLife; // 0..1
    // Bell-curve alpha — fade in fast, fade out slow
    const alpha =
      t < 0.15
        ? t / 0.15
        : t < 0.85
          ? 1 - (t - 0.15) / 0.85
          : 0.15 - (t - 0.85);
    const radius = this.size * (0.6 + t * 1.2);

    const grad = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      radius
    );
    grad.addColorStop(0, this.color);
    grad.addColorStop(0.4, this.color);
    grad.addColorStop(1, "transparent");
    ctx.globalAlpha = Math.max(0, alpha) * 0.55;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

export default function HeroAura() {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let rect = { width: 0, height: 0 };

    const resize = () => {
      const r = wrapper.getBoundingClientRect();
      rect = { width: r.width, height: r.height };
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);

    let particles = [];
    let primaryColor = themeStore.primary.get() || "#ffb53d";
    let accentColor = themeStore.accent.get() || "#ffe066";
    let intensity = themeStore.intensity.get() || 0.5;

    // Subscribe via .on() so React never re-renders on theme shifts.
    const unsubP = themeStore.primary.on?.("change", (v) => (primaryColor = v));
    const unsubA = themeStore.accent.on?.("change", (v) => (accentColor = v));
    const unsubI = themeStore.intensity.on?.("change", (v) => (intensity = v));

    let last = performance.now();
    let raf = 0;
    // Visibility gating — pause when offscreen or tab hidden
    let visible = true;
    const io = new IntersectionObserver(
      (entries) => (visible = entries[0]?.isIntersecting ?? true),
      { threshold: 0 }
    );
    io.observe(wrapper);
    const onVisibility = () => (visible = !document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    const tick = (now) => {
      const dt = Math.min(48, now - last); // cap dt to avoid jumps after tab swaps
      last = now;

      if (!visible) {
        raf = requestAnimationFrame(tick);
        return;
      }

      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.globalCompositeOperation = "lighter";

      // Density: 18 (calm) → 60 (action). Spawn rate also scales.
      const targetCount = Math.floor(18 + intensity * 42);
      const speedMul = 0.7 + intensity * 0.9;

      // Trim excess
      if (particles.length > Math.min(MAX_PARTICLES, targetCount)) {
        particles.length = targetCount;
      }
      // Spawn — small batch per frame so density ramps in smoothly
      while (particles.length < targetCount) {
        const w = new Wisp(rect);
        // Mix primary + accent for variety
        w.color = Math.random() < 0.6 ? primaryColor : accentColor;
        particles.push(w);
      }

      for (const p of particles) {
        p.update(dt / 16.67, speedMul);
        if (p.alive) p.draw(ctx);
      }
      // Recycle dead particles (cheaper than re-allocating)
      for (const p of particles) {
        if (!p.alive) {
          p.spawn(rect);
          p.color = Math.random() < 0.6 ? primaryColor : accentColor;
        }
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      unsubP?.();
      unsubA?.();
      unsubI?.();
    };
  }, []);

  return (
    <div ref={wrapperRef} className={styles.wrap} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
