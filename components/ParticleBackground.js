"use client";
import { useEffect, useRef, useCallback } from "react";
import styles from "./ParticleBackground.module.css";

const CONFIG = {
  particleCount: 60,
  connectionDistance: 140,
  particleSpeed: 0.3,
  mouseRadius: 200,
  mouseForce: 0.02,
  baseOpacity: 0.35,
  lineOpacity: 0.08,
  colors: ["#7c5cfc", "#a78bfa", "#c084fc", "#6366f1", "#818cf8"],
  minSize: 1.2,
  maxSize: 2.8,
};

class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.vx = (Math.random() - 0.5) * CONFIG.particleSpeed;
    this.vy = (Math.random() - 0.5) * CONFIG.particleSpeed;
    this.size = CONFIG.minSize + Math.random() * (CONFIG.maxSize - CONFIG.minSize);
    this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
    this.opacity = CONFIG.baseOpacity * (0.4 + Math.random() * 0.6);
    this.pulseSpeed = 0.005 + Math.random() * 0.01;
    this.pulsePhase = Math.random() * Math.PI * 2;
  }

  update(mouseX, mouseY, deltaTime) {
    // Mouse repulsion/attraction
    if (mouseX !== null && mouseY !== null) {
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONFIG.mouseRadius && dist > 0) {
        const force = (1 - dist / CONFIG.mouseRadius) * CONFIG.mouseForce;
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;
      }
    }

    // Damping
    this.vx *= 0.99;
    this.vy *= 0.99;

    // Clamp speed
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > CONFIG.particleSpeed * 2) {
      this.vx = (this.vx / speed) * CONFIG.particleSpeed * 2;
      this.vy = (this.vy / speed) * CONFIG.particleSpeed * 2;
    }

    this.x += this.vx;
    this.y += this.vy;

    // Wrap around edges
    if (this.x < -10) this.x = this.canvas.width + 10;
    if (this.x > this.canvas.width + 10) this.x = -10;
    if (this.y < -10) this.y = this.canvas.height + 10;
    if (this.y > this.canvas.height + 10) this.y = -10;

    // Pulse
    this.pulsePhase += this.pulseSpeed;
    this.currentOpacity = this.opacity * (0.6 + 0.4 * Math.sin(this.pulsePhase));
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.currentOpacity;
    ctx.fill();

    // Glow effect
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.size * 3
    );
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.globalAlpha = this.currentOpacity * 0.3;
    ctx.fill();
  }
}

export default function ParticleBackground() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: null, y: null });
  const animFrameRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.x = null;
    mouseRef.current.y = null;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    // Initialize particles
    particlesRef.current = Array.from(
      { length: CONFIG.particleCount },
      () => new Particle(canvas)
    );

    let lastTime = performance.now();

    const animate = (time) => {
      const delta = time - lastTime;
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      const { x: mx, y: my } = mouseRef.current;

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].update(mx, my, delta);
        particles[i].draw(ctx);
      }

      // Draw connections
      ctx.globalAlpha = CONFIG.lineOpacity;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONFIG.connectionDistance) {
            const opacity = 1 - dist / CONFIG.connectionDistance;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = particles[i].color;
            ctx.globalAlpha = opacity * CONFIG.lineOpacity;
            ctx.stroke();
          }
        }
      }

      // Draw mouse connection
      if (mx !== null && my !== null) {
        for (let i = 0; i < particles.length; i++) {
          const dx = particles[i].x - mx;
          const dy = particles[i].y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONFIG.mouseRadius) {
            const opacity = 1 - dist / CONFIG.mouseRadius;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mx, my);
            ctx.strokeStyle = "#a78bfa";
            ctx.globalAlpha = opacity * 0.15;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return (
    <div className={styles.canvasContainer} aria-hidden="true">
      <div className={`${styles.orb} ${styles.orb1}`} />
      <div className={`${styles.orb} ${styles.orb2}`} />
      <div className={`${styles.orb} ${styles.orb3}`} />
      <div className={`${styles.orb} ${styles.orb4}`} />
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
