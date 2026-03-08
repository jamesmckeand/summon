"use client";

import { useEffect, useRef } from "react";

// Deterministic pseudo-random from seed
const rv = (seed: number): number =>
  ((Math.abs(Math.sin(seed * 92.3 + 41.7)) * 99999) % 1);

type Variant = "stand" | "rarm" | "larm" | "phone";
const VARIANTS: Variant[] = ["stand", "rarm", "larm", "stand", "phone", "stand", "rarm", "larm"];

function PersonPaths({ v }: { v: Variant }) {
  return (
    <>
      <ellipse cx="50" cy="18" rx="15" ry="16" />
      <path d="M 25 33 C 21 58 23 78 26 100 L 74 100 C 77 78 79 58 75 33 C 66 27 34 27 25 33 Z" />
      {(v === "rarm" || v === "phone") && (
        <path d="M 74 42 L 95 15 L 99 19 L 78 46 Z" />
      )}
      {v === "larm" && (
        <path d="M 26 42 L 5 15 L 1 19 L 22 46 Z" />
      )}
      {v === "phone" && (
        <rect x="92" y="11" width="10" height="15" rx="2" fill="rgba(185, 215, 255, 0.85)" />
      )}
    </>
  );
}

function mkRow(n: number, baseY: number, sc: number, fill: string, W: number) {
  const gap = W / n;
  return Array.from({ length: n }, (_, i) => ({
    x: gap * i + gap * 0.1 + rv(i * 7 + 1) * gap * 0.8,
    y: baseY - rv(i * 7 + 2) * sc * 7,
    sc,
    fill,
    v: VARIANTS[i % VARIANTS.length],
  }));
}

export default function CrowdHero() {
  const spotRef = useRef<HTMLDivElement>(null);
  const targetX = useRef(50);
  const curX = useRef(50);
  const raf = useRef<number>(undefined);
  const active = useRef(false);

  useEffect(() => {
    // Smooth spotlight lerp loop
    const tick = () => {
      curX.current += (targetX.current - curX.current) * 0.08;
      spotRef.current?.style.setProperty("--sx", `${curX.current}%`);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    const hero = document.getElementById("hero-section");
    if (!hero) return () => { if (raf.current) cancelAnimationFrame(raf.current); };

    const onMove = (e: MouseEvent) => {
      if (!active.current) return;
      const rect = hero.getBoundingClientRect();
      targetX.current = ((e.clientX - rect.left) / rect.width) * 100;
    };
    const onEnter = () => {
      active.current = true;
      if (spotRef.current) spotRef.current.style.opacity = "1";
    };
    const onLeave = () => {
      active.current = false;
      if (spotRef.current) spotRef.current.style.opacity = "0";
    };

    hero.addEventListener("mouseenter", onEnter);
    hero.addEventListener("mouseleave", onLeave);
    document.addEventListener("mousemove", onMove);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      hero.removeEventListener("mouseenter", onEnter);
      hero.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mousemove", onMove);
    };
  }, []);

  const W = 1440, H = 520;
  const back  = mkRow(30, 350, 0.44, "#16202e", W);
  const mid   = mkRow(20, 435, 0.68, "#0f1520", W);
  const front = mkRow(14, 520, 1.00, "#090c18", W);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">

      {/* Stage glow — warm centre fading to cool purple/blue */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% -5%, rgba(255, 215, 110, 0.14) 0%, rgba(180, 100, 255, 0.07) 45%, rgba(70, 100, 255, 0.04) 65%, transparent 80%)",
        }}
      />

      {/* Mouse-following spotlight cone */}
      <div
        ref={spotRef}
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: 0,
          background:
            "radial-gradient(ellipse 260px 68% at var(--sx, 50%) -6%, rgba(255, 240, 190, 0.22) 0%, rgba(255, 225, 160, 0.08) 42%, transparent 68%)",
        } as React.CSSProperties}
      />

      {/* SVG crowd */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax slice"
        className="absolute bottom-0 left-0 w-full h-full"
      >
        <defs>
          {/* Alpha mask: crowd fades from invisible at top to opaque at bottom */}
          <linearGradient id="cFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="white" stopOpacity="0" />
            <stop offset="30%"  stopColor="white" stopOpacity="0" />
            <stop offset="55%"  stopColor="white" stopOpacity="0.35" />
            <stop offset="75%"  stopColor="white" stopOpacity="0.85" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </linearGradient>
          <mask id="cMask">
            <rect width={W} height={H} fill="url(#cFade)" />
          </mask>
        </defs>

        <g mask="url(#cMask)">
          {/* Back row — slowest sway */}
          <g style={{ animation: "crowd-sway 22s ease-in-out infinite" }}>
            {back.map(({ x, y, sc, fill, v }, i) => (
              <g
                key={i}
                transform={`translate(${x - 50 * sc} ${y - 100 * sc}) scale(${sc})`}
                fill={fill}
              >
                <PersonPaths v={v} />
              </g>
            ))}
          </g>

          {/* Mid row — opposite phase */}
          <g style={{ animation: "crowd-sway-r 16s ease-in-out infinite 3s" }}>
            {mid.map(({ x, y, sc, fill, v }, i) => (
              <g
                key={i}
                transform={`translate(${x - 50 * sc} ${y - 100 * sc}) scale(${sc})`}
                fill={fill}
              >
                <PersonPaths v={v} />
              </g>
            ))}
          </g>

          {/* Front row — slowest, offset phase */}
          <g style={{ animation: "crowd-sway 28s ease-in-out infinite 7s" }}>
            {front.map(({ x, y, sc, fill, v }, i) => (
              <g
                key={i}
                transform={`translate(${x - 50 * sc} ${y - 100 * sc}) scale(${sc})`}
                fill={fill}
              >
                <PersonPaths v={v} />
              </g>
            ))}
          </g>
        </g>
      </svg>

      {/* Bottom edge fade — blends crowd into the rest of the page */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{ background: "linear-gradient(to top, #080B14 0%, transparent 100%)" }}
      />
    </div>
  );
}
