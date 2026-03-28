"use client";

import { useEffect, useRef } from "react";

// Base sizes are for desktop (800px+ wide). Scaled down proportionally on mobile.
const ORBS = [
  { base: 620, color: "#6366F1", opacity: 0.16, speed: 0.28 },
  { base: 400, color: "#3B82F6", opacity: 0.11, speed: 0.38 },
  { base: 320, color: "#C084FC", opacity: 0.09, speed: 0.22 },
  { base: 480, color: "#818CF8", opacity: 0.13, speed: 0.32 },
  { base: 240, color: "#38BDF8", opacity: 0.08, speed: 0.48 },
  { base: 280, color: "#A78BFA", opacity: 0.10, speed: 0.18 },
  { base: 360, color: "#7C3AED", opacity: 0.10, speed: 0.26 },
  { base: 200, color: "#60A5FA", opacity: 0.07, speed: 0.42 },
  { base: 500, color: "#4F46E5", opacity: 0.08, speed: 0.20 },
];

export default function HeroOrbs() {
  const containerRef = useRef<HTMLDivElement>(null);
  const divsRef = useRef<(HTMLDivElement | null)[]>([]);
  const stateRef = useRef<{ x: number; y: number; vx: number; vy: number; size: number }[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function getScale(w: number) {
      // Full size at 800px+, scale down linearly to 45% at 375px (iPhone)
      return Math.max(0.45, Math.min(1, w / 800));
    }

    function init() {
      const w = container!.offsetWidth;
      const h = container!.offsetHeight;
      const scale = getScale(w);

      stateRef.current = ORBS.map((orb) => {
        const size = orb.base * scale;
        return {
          size,
          x: size / 2 + Math.random() * Math.max(0, w - size),
          y: size / 2 + Math.random() * Math.max(0, h - size),
          vx: (Math.random() > 0.5 ? 1 : -1) * orb.speed * scale,
          vy: (Math.random() > 0.5 ? 1 : -1) * orb.speed * 0.7 * scale,
        };
      });
    }

    function tick() {
      const w = container!.offsetWidth;
      const h = container!.offsetHeight;

      stateRef.current.forEach((s, i) => {
        s.x += s.vx;
        s.y += s.vy;

        if (s.x - s.size / 2 < 0)  { s.x = s.size / 2;      s.vx = Math.abs(s.vx); }
        if (s.x + s.size / 2 > w)  { s.x = w - s.size / 2;  s.vx = -Math.abs(s.vx); }
        if (s.y - s.size / 2 < 0)  { s.y = s.size / 2;      s.vy = Math.abs(s.vy); }
        if (s.y + s.size / 2 > h)  { s.y = h - s.size / 2;  s.vy = -Math.abs(s.vy); }

        const div = divsRef.current[i];
        if (div) {
          div.style.width = `${s.size}px`;
          div.style.height = `${s.size}px`;
          div.style.transform = `translate(${s.x - s.size / 2}px, ${s.y - s.size / 2}px)`;
        }
      });

      rafRef.current = requestAnimationFrame(tick);
    }

    init();
    rafRef.current = requestAnimationFrame(tick);

    const onResize = () => { init(); };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Dot grid — thinner on mobile */}
      <div
        className="absolute inset-0 opacity-[0.028]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Orbs */}
      {ORBS.map((orb, i) => (
        <div
          key={i}
          ref={(el) => { divsRef.current[i] = el; }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            borderRadius: "50%",
            background: `radial-gradient(ellipse at center, ${orb.color} 0%, transparent 68%)`,
            opacity: orb.opacity,
            willChange: "transform",
          }}
        />
      ))}
      {/* Bottom fade into marquee */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 sm:h-56"
        style={{ background: "linear-gradient(to top, var(--background), transparent)" }}
      />
    </div>
  );
}
