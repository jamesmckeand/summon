"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import { Star, Bell, MapPin, Zap } from "lucide-react";

const PERKS = [
  {
    icon: Star,
    title: "Superfan badge",
    desc: "Stand out on leaderboards with a badge next to your name.",
  },
  {
    icon: Bell,
    title: "Early show alerts",
    desc: "Get notified before anyone else when a threshold is crossed in your city.",
  },
  {
    icon: MapPin,
    title: "Multi-city tracking",
    desc: "Track demand across multiple cities, not just your home city.",
  },
  {
    icon: Zap,
    title: "Support the mission",
    desc: "Help keep Summon running and growing so more shows happen.",
  },
];

export default function SuperfanPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const { url, error: err } = await res.json();
      if (err) { setError(err); setLoading(false); return; }
      window.location.href = url;
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative pt-24 pb-20 px-6 max-w-xl mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
          <Star className="w-3 h-3" />
          Superfan
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Go beyond voting
        </h1>
        <p className="text-muted-foreground text-lg mb-10">
          Support Summon and unlock perks for the fans who make shows happen.
        </p>

        {/* Pricing */}
        <div className="card-solid rounded-2xl p-8 mb-8 text-left">
          <div className="text-center mb-8">
            <p className="text-5xl font-bold gradient-display bg-clip-text text-transparent">$4</p>
            <p className="text-muted-foreground text-sm mt-1">CAD / month</p>
          </div>

          <div className="flex flex-col gap-4">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-4 rounded-xl gradient-brand text-white font-semibold text-base hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Redirecting…" : "Become a Superfan →"}
        </button>

        <p className="text-xs text-muted-foreground mt-4">
          Cancel anytime. Payments processed securely by Stripe.
        </p>

        <Link href="/dashboard" className="block mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
