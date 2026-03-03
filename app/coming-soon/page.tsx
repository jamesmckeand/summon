"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Music2, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ComingSoonPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function join() {
    if (!email) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (res.ok) {
      setDone(true);
    } else {
      setError("Something went wrong. Try again.");
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Subtle dark radial depth — stays within the dark range, no brightness jump */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,#19132B_0%,transparent_70%)] pointer-events-none" />
      {/* Ambient glow — very low opacity so they don't brighten the base */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] rounded-full bg-[#7C2EAD]/8 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-[220px] h-[220px] rounded-full bg-[#FBC2FF]/5 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[200px] h-[200px] rounded-full bg-[#7C2EAD]/6 blur-[80px] pointer-events-none" />

      {/* CSS-animated content — avoids framer-motion SSR hydration flash */}
      <div className="relative z-10 text-center max-w-md w-full">

        {/* Logo */}
        <div className="anim-fade-up mb-10" style={{ animationDelay: "0.05s" }}>
          <span className="text-2xl font-bold gradient-brand-text">Summon</span>
        </div>

        {/* Headline */}
        <h1
          className="anim-fade-up text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-4"
          style={{ animationDelay: "0.1s" }}
        >
          Something big is{" "}
          <span className="gradient-brand-text">coming.</span>
        </h1>

        <p
          className="anim-fade-up text-muted-foreground text-lg leading-relaxed mb-10"
          style={{ animationDelay: "0.2s" }}
        >
          Summon lets fans vote for the artists they want to see live in their city.
          When enough people agree — we make the show happen.
        </p>

        {/* Email capture */}
        {done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-8 flex flex-col items-center gap-3"
          >
            <CheckCircle className="w-10 h-10 text-primary" />
            <p className="font-semibold text-lg">You&apos;re on the list.</p>
            <p className="text-sm text-muted-foreground">
              We&apos;ll email you when we launch. Tell your friends.
            </p>
          </motion.div>
        ) : (
          <div
            className="anim-fade-up glass rounded-2xl p-6 flex flex-col gap-3"
            style={{ animationDelay: "0.3s" }}
          >
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              Get early access
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && join()}
                className="flex-1 h-11 rounded-xl bg-muted/50 border-border/60"
              />
              <Button
                onClick={join}
                disabled={loading || !email}
                className="gradient-brand border-0 text-white h-11 px-5 rounded-xl font-semibold glow-primary-sm shrink-0"
              >
                {loading ? "…" : <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">No spam. Just a heads-up when we go live.</p>
          </div>
        )}

        {/* How it works teaser */}
        <div
          className="anim-fade-up mt-10 flex items-center justify-center gap-6 text-xs text-muted-foreground"
          style={{ animationDelay: "0.4s" }}
        >
          <span className="flex items-center gap-1.5">
            <Music2 className="w-3.5 h-3.5 text-primary" />
            Vote for artists
          </span>
          <span className="text-border">→</span>
          <span>Demand builds</span>
          <span className="text-border">→</span>
          <span>Show happens</span>
        </div>
      </div>
    </div>
  );
}
