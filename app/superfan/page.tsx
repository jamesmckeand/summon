"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Star, Bell, MapPin, Zap, Check } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { createClient } from "@/lib/supabase/client";

const PERKS = [
  {
    icon: Star,
    title: "Superfan badge",
    desc: "Stand out on leaderboards with a badge next to your name.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    icon: Bell,
    title: "Early show alerts",
    desc: "Get notified before anyone else when a threshold is crossed in your city.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: MapPin,
    title: "Multi-city tracking",
    desc: "Track demand across multiple cities, not just your home city.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Zap,
    title: "Support the mission",
    desc: "Help keep Summon running and growing so more shows happen.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
];

export default function SuperfanPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuperfan, setIsSuperfan] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setIsSuperfan(false); return; }
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", data.user.id)
        .eq("status", "active")
        .maybeSingle();
      setIsSuperfan(!!sub);
    });
  }, []);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const { url, error: err } = await res.json();
      if (err) { setError(err); setLoading(false); return; }
      const { Capacitor } = await import("@capacitor/core").catch(() => ({ Capacitor: { isNativePlatform: () => false } }));
      if (Capacitor.isNativePlatform()) {
        window.open(url, "_system");
      } else {
        window.location.href = url;
      }
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  async function handleManage() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch { /* ignore */ }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-20"
        style={{ background: "radial-gradient(ellipse at top, oklch(0.58 0.22 264 / 40%) 0%, transparent 70%)" }} />

      <div className="relative pt-24 pb-20 px-6 max-w-lg mx-auto">

        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-brand mb-5"
            style={{ boxShadow: "0 0 32px rgba(99,102,241,0.35)" }}>
            <Star className="w-7 h-7 text-white fill-white" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary/70 mb-2">Superfan</p>
          <h1 className="text-3xl font-bold tracking-tight mb-3">Go beyond voting</h1>
          <p className="text-muted-foreground">
            Support Summon and unlock perks for the fans who make shows happen.
          </p>
        </motion.div>

        {/* Pricing card */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.08}
          className="glass rounded-2xl overflow-hidden mb-4">

          {/* Price header */}
          <div className="px-6 py-6 text-center border-b border-white/7"
            style={{ background: "linear-gradient(to bottom, oklch(0.58 0.22 264 / 8%), transparent)" }}>
            <div className="flex items-end justify-center gap-1.5">
              <span className="text-5xl font-extrabold gradient-brand-text leading-none">$4</span>
              <span className="text-muted-foreground text-sm mb-1.5">/ month</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">Cancel anytime · No commitment</p>
          </div>

          {/* Perks */}
          <div className="px-6 py-5 flex flex-col gap-4">
            {PERKS.map(({ icon: Icon, title, desc, color, bg }, i) => (
              <motion.div key={title} initial="hidden" animate="visible" variants={fadeUp} custom={0.12 + i * 0.04}
                className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm">{title}</p>
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {error && <p className="text-red-400 text-sm mb-3 text-center">{error}</p>}

        {/* CTA */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.32}>
          {isSuperfan ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-3 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <span className="text-sm text-yellow-400 font-medium">⭐ You&apos;re already a Superfan</span>
              </div>
              <button
                onClick={handleManage}
                disabled={loading}
                className="w-full py-3 rounded-xl glass text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {loading ? "Loading…" : "Manage subscription →"}
              </button>
            </>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={loading || isSuperfan === null}
              className="w-full py-4 rounded-xl gradient-brand text-white font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50 glow-primary-sm"
            >
              {loading ? "Redirecting…" : "Become a Superfan →"}
            </button>
          )}

          <p className="text-xs text-muted-foreground mt-3 text-center">
            Payments processed securely by Stripe. Cancel anytime.
          </p>

          <div className="flex justify-center gap-6 mt-5">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to dashboard
            </Link>
            <Link href="/explore" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Explore artists
            </Link>
          </div>

          <div className="flex justify-center gap-4 mt-4">
            <Link href="/privacy" className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
              Privacy Policy
            </Link>
            <span className="text-xs text-muted-foreground/30">·</span>
            <Link href="/terms" className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
              Terms of Service
            </Link>
            <span className="text-xs text-muted-foreground/30">·</span>
            <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
              EULA
            </a>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
