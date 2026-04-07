"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fadeUp } from "@/lib/animations";
import HeroOrbs from "@/components/HeroOrbs";
import Marquee from "@/components/Marquee";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { ARTISTS } from "@/lib/data/artists";
import { CITIES } from "@/lib/data/cities";
import { createClient } from "@/lib/supabase/client";

async function signInWithApple() {
  const supabase = createClient();
  await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
}

const STEPS = [
  {
    n: "01",
    title: "Sign up free",
    body: "Create your account with Apple or email in seconds. No credit card needed.",
  },
  {
    n: "02",
    title: "Vote in your city",
    body: "Pick your city, find your favourite artists, and cast your votes. Every vote is publicly counted.",
  },
  {
    n: "03",
    title: "Watch it happen",
    body: "When votes hit a venue threshold, we contact venues and promoters on behalf of the fans — and make the show real.",
  },
];

const TIERS = [
  { label: "Bar / Club",   votes: "500"    },
  { label: "Theatre",      votes: "2,500"  },
  { label: "Concert Hall", votes: "7,500"  },
  { label: "Arena",        votes: "25,000" },
];

export default function Home() {
  const [stats, setStats] = useState({
    totalVotes: 0,
    artistCount: ARTISTS.length,
    cityCount: CITIES.length,
  });
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center pt-20 pb-10">

        {/* Hero background — bouncing orbs */}
        <HeroOrbs />

        {/* Overline badge */}
        <div className="anim-fade-up flex items-center gap-2 mb-8" style={{ animationDelay: "0.1s" }}>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs font-medium text-muted-foreground tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
            Live music demand
          </span>
        </div>

        {/* Headline */}
        <h1
          className="anim-fade-up font-extrabold tracking-tight leading-[1.02] max-w-5xl"
          style={{ animationDelay: "0.18s", fontSize: "clamp(3rem, 9vw, 7rem)" }}
        >
          Your city.
          <br />
          <span className="gradient-display">Your artists.</span>
          <br />
          Your show.
        </h1>

        {/* Subtext */}
        <p
          className="anim-fade-up mt-7 text-base sm:text-lg text-muted-foreground max-w-md leading-relaxed"
          style={{ animationDelay: "0.3s" }}
        >
          Vote for the artists you want to see live. When enough fans agree,
          we make the show happen — for real.
        </p>

        {/* CTAs */}
        <div
          className="anim-fade-up mt-10 flex flex-col sm:flex-row items-center gap-3"
          style={{ animationDelay: "0.4s" }}
        >
          {loggedIn ? (
            <>
              <Link href="/explore">
                <Button size="lg" className="h-12 px-7 rounded-xl gradient-brand glow-primary border-0 text-white font-semibold text-sm w-full sm:w-auto">
                  Start voting now <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="h-12 px-7 rounded-xl border-white/10 bg-white/[0.03] hover:bg-white/[0.06] font-semibold text-sm w-full sm:w-auto">
                  My dashboard
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Button
                size="lg"
                onClick={signInWithApple}
                className="h-12 px-7 rounded-xl bg-white hover:bg-gray-100 text-black font-semibold border-0 text-sm w-full sm:w-auto"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                </svg>
                Continue with Apple
              </Button>
              <Link href="/explore">
                <Button size="lg" variant="outline" className="h-12 px-7 rounded-xl border-white/10 bg-white/[0.03] hover:bg-white/[0.06] font-semibold text-sm w-full sm:w-auto">
                  Browse artists <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {!loggedIn && (
          <p className="anim-fade-up mt-4 text-xs text-muted-foreground" style={{ animationDelay: "0.48s" }}>
            Or{" "}
            <Link href="/login" className="text-foreground/70 hover:text-foreground underline underline-offset-2 transition-colors">
              sign in with email
            </Link>
          </p>
        )}

        {/* Stats cards — dashboard style */}
        <div
          className="anim-fade-up mt-14 grid grid-cols-3 gap-3 w-full max-w-sm"
          style={{ animationDelay: "0.54s" }}
        >
          {[
            { value: "1M+",                                                               label: "Artists",    sub: "on demand"   },
            { value: `${stats.cityCount}+`,                                               label: "Cities",     sub: "worldwide"   },
            { value: stats.totalVotes > 0 ? stats.totalVotes.toLocaleString() : "—",     label: "Votes cast", sub: "and growing"  },
          ].map((s) => (
            <div key={s.label} className="card-solid rounded-2xl p-4 text-center flex flex-col gap-1">
              <p className="text-xl sm:text-2xl font-extrabold gradient-brand-text tabular-nums leading-none">{s.value}</p>
              <p className="text-xs font-semibold text-foreground">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Marquee — flows below stats, not overlapping next section */}
        <div className="relative mt-10 w-full anim-fade-up" style={{ animationDelay: "0.6s" }}>
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <Marquee />
        </div>

      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-6 py-32 max-w-5xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary/70 mb-4">How it works</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight max-w-xl">
            Three steps to a show<br />in your city.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i * 0.08}
              className="card-solid rounded-2xl p-7 flex flex-col gap-6 hover:border-primary/20 transition-colors group"
            >
              {/* Step number badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">{step.n}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-xl tracking-tight">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.body}</p>
              </div>
              {/* Bottom accent bar */}
              <div className="h-0.5 w-8 gradient-brand rounded-full group-hover:w-16 transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── VENUE TIERS — budget card style ── */}
      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="card-solid rounded-2xl p-8 sm:p-10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, #6366F110 0%, transparent 65%)" }} />

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary/70 mb-2">The threshold system</p>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight max-w-xs">
              Real shows, not just data.
            </h3>
          </div>

          <p className="text-muted-foreground leading-relaxed max-w-lg mb-8 text-sm">
            When votes hit a venue threshold, Summon contacts the venue directly on behalf of the fans.
            We match demand to the right sized room — from intimate clubs to full arenas.
          </p>

          {/* Venue tier tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TIERS.map((t, i) => (
              <motion.div
                key={t.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i * 0.06}
                className="rounded-xl p-4 border border-white/7 bg-white/[0.025] text-center"
              >
                <p className="text-lg font-extrabold gradient-brand-text tabular-nums">{t.votes}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Any artist card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0.1}
          className="mt-4"
        >
          <Link href="/explore">
            <div className="card-solid rounded-2xl p-7 flex items-center gap-5 hover:border-primary/20 transition-colors group cursor-pointer">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary/70 mb-2">Any artist</p>
                <h3 className="font-bold text-xl tracking-tight mb-1.5">Millions of artists. Instantly.</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Can&apos;t find your favourite act? Search on the explore page — we pull from millions of artists and add them to the vote immediately.
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl gradient-brand flex items-center justify-center shrink-0 glow-primary-sm group-hover:scale-105 transition-transform">
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
            </div>
          </Link>
        </motion.div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="px-6 py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 50% at 50% 50%, #6366F10C 0%, transparent 70%)" }} />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="max-w-2xl mx-auto relative"
        >
          <h2
            className="font-extrabold tracking-tight leading-tight mb-5"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
          >
            Your city is{" "}
            <span className="gradient-display">waiting.</span>
          </h2>
          <p className="text-muted-foreground mb-10 text-lg max-w-md mx-auto leading-relaxed">
            Join fans already voting to bring their favourite artists home.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={loggedIn ? "/explore" : "/login"}>
              <Button size="lg" className="gradient-brand glow-primary border-0 text-white font-semibold text-base px-8 h-12 rounded-xl">
                Start voting now <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href={loggedIn ? "/dashboard" : "/explore"}>
              <Button size="lg" variant="outline" className="border-white/10 bg-white/[0.03] hover:bg-white/[0.06] font-medium text-base h-12 rounded-xl px-8">
                {loggedIn ? "My dashboard" : "Browse artists"}
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
