"use client";

import { useEffect, useState } from "react";

function TicketManSVG() {
  return (
    <svg
      width="44"
      height="56"
      viewBox="0 0 44 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Arms */}
      <rect x="-5" y="17" width="13" height="5" rx="2.5" fill="#2D1B4E" stroke="#9333ea" strokeWidth="1.5" />
      <rect x="36" y="17" width="13" height="5" rx="2.5" fill="#2D1B4E" stroke="#9333ea" strokeWidth="1.5" />

      {/* Ticket body */}
      <rect x="2" y="2" width="40" height="36" rx="6" fill="#19132B" />
      <rect x="2" y="2" width="40" height="36" rx="6" fill="url(#tg)" opacity="0.8" />
      <rect x="2" y="2" width="40" height="36" rx="6" stroke="#9333ea" strokeWidth="1.5" />

      {/* Perforation */}
      <line x1="2" y1="21" x2="42" y2="21" stroke="#9333ea" strokeWidth="1" strokeDasharray="3 2" opacity="0.7" />
      <path d="M2 19.5 Q-1.5 21 2 22.5" fill="#060010" stroke="#9333ea" strokeWidth="1.2" />
      <path d="M42 19.5 Q45.5 21 42 22.5" fill="#060010" stroke="#9333ea" strokeWidth="1.2" />

      {/* Eyes */}
      <circle cx="15" cy="12" r="4" fill="white" />
      <circle cx="29" cy="12" r="4" fill="white" />
      <circle cx="16" cy="12" r="2" fill="#19132B" />
      <circle cx="30" cy="12" r="2" fill="#19132B" />
      <circle cx="16.7" cy="11.2" r="0.9" fill="white" opacity="0.9" />
      <circle cx="30.7" cy="11.2" r="0.9" fill="white" opacity="0.9" />

      {/* Smile */}
      <path d="M16 17 Q22 21 28 17" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Lower ticket detail */}
      <rect x="8" y="25" width="28" height="2" rx="1" fill="#9333ea" opacity="0.5" />
      <rect x="12" y="29" width="20" height="2" rx="1" fill="#9333ea" opacity="0.35" />
      <rect x="10" y="33" width="24" height="1.5" rx="0.75" fill="#9333ea" opacity="0.25" />

      {/* Legs */}
      <rect x="11" y="38" width="8" height="13" rx="4" fill="#19132B" stroke="#9333ea" strokeWidth="1.5" />
      <rect x="25" y="38" width="8" height="13" rx="4" fill="#19132B" stroke="#9333ea" strokeWidth="1.5" />
      {/* Feet */}
      <rect x="8" y="48" width="12" height="5" rx="2.5" fill="#9333ea" />
      <rect x="24" y="48" width="12" height="5" rx="2.5" fill="#9333ea" />

      <defs>
        <linearGradient id="tg" x1="2" y1="2" x2="42" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function TicketMan() {
  const [phase, setPhase] = useState<"run" | "peek">("run");

  useEffect(() => {
    const t = setTimeout(() => setPhase("peek"), 2600);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Running phase — fixed so it truly spans the full viewport width */}
      {phase === "run" && (
        <div
          className="pointer-events-none fixed z-20"
          style={{
            top: "42vh",
            left: 0,
            animation: "ticket-run-x 2.2s cubic-bezier(0.4, 0, 0.4, 1) 0.2s both",
          }}
        >
          {/* Inner div handles the bounce so transform axes don't conflict */}
          <div style={{ animation: "ticket-bounce 0.36s ease-in-out 0.4s infinite" }}>
            <TicketManSVG />
          </div>
        </div>
      )}

      {/* Peeking phase — sits below the h1, clips so only eyes show */}
      {phase === "peek" && (
        <div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 cursor-pointer z-10"
          style={{ animation: "ticket-peek-in 0.5s ease forwards" }}
          title="👋"
        >
          <div className="ticket-peek">
            <div className="ticket-peek-inner">
              <TicketManSVG />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
