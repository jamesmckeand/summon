"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Music2, MapPin, TrendingUp, Zap, ChevronRight, ArrowRight, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { fadeUp } from "@/lib/animations";
import Marquee from "@/components/Marquee";
import Nav from "@/components/Nav";
import { ARTISTS } from "@/lib/data/artists";
import { CITIES } from "@/lib/data/cities";
import { createClient } from "@/lib/supabase/client";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Sign up free",
    description: "Create your account with Spotify or email. Takes 10 seconds, no credit card needed.",
    icon: Music2,
  },
  {
    step: "02",
    title: "Vote in your city",
    description: "Pick your city, find your favourite artists, and cast your votes. Every vote counts toward a real show.",
    icon: MapPin,
  },
  {
    step: "03",
    title: "Watch demand build",
    description: "As votes accumulate, we match the demand to local venues and reach out to make the show happen.",
    icon: TrendingUp,
  },
];

async function signInWithSpotify() {
  const supabase = createClient();
  await supabase.auth.signInWithOAuth({
    provider: "spotify",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: "user-read-email user-read-private user-top-read",
    },
  });
}

async function signInWithApple() {
  const supabase = createClient();
  await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
}

export default function Home() {
  const [stats, setStats] = useState({
    totalVotes: 0,
    artistCount: ARTISTS.length,
    cityCount: CITIES.length,
  });
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null); // null = loading

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => { /* keep defaults */ });
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">

      <Nav />

      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden pt-24">

        {/* Ambient glow — kept dark enough to not flash when content is opacity 0 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-[#19132B]/80 blur-[140px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/3 w-[200px] h-[200px] rounded-full bg-[#7C2EAD]/8 blur-[90px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[200px] h-[200px] rounded-full bg-[#FBC2FF]/5 blur-[90px] pointer-events-none" />

        {/* Headline */}
        <h1
          className="anim-fade-up text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight leading-[1.04] max-w-4xl"
          style={{ animationDelay: "0.2s" }}
        >
          Your city.
          <br />
          <span className="gradient-brand-text">Your artists.</span>
          <br />
          Your show.
        </h1>

        {/* Subtext */}
        <p
          className="anim-fade-up mt-7 text-base sm:text-lg text-muted-foreground max-w-md leading-relaxed"
          style={{ animationDelay: "0.32s" }}
        >
          Vote for the artists you want to see live. When enough fans agree,
          we make the show happen — for real.
        </p>

        {/* CTAs */}
        <div
          className="anim-fade-up mt-10 flex flex-col sm:flex-row items-center gap-3"
          style={{ animationDelay: "0.44s" }}
        >
          {loggedIn ? (
            <>
              <Link href="/explore">
                <Button
                  size="lg"
                  className="h-13 px-6 rounded-xl gradient-brand glow-primary border-0 text-white font-semibold text-sm transition-all w-full sm:w-auto"
                >
                  Continue voting
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 px-6 rounded-xl border-border/50 font-semibold text-sm transition-all hover:bg-muted w-full sm:w-auto"
                >
                  My dashboard
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Button
                size="lg"
                onClick={signInWithSpotify}
                className="h-13 px-6 rounded-xl bg-[#1DB954] hover:bg-[#1aa34a] text-black font-semibold border-0 text-sm transition-all w-full sm:w-auto"
              >
                <Music2 className="w-4 h-4 mr-2" />
                Continue with Spotify
              </Button>
              <Button
                size="lg"
                onClick={signInWithApple}
                className="h-13 px-6 rounded-xl bg-white hover:bg-gray-100 text-black font-semibold border-0 text-sm transition-all w-full sm:w-auto"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                </svg>
                Continue with Apple
              </Button>
              <Link href="/explore">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 px-6 rounded-xl border-border/50 font-semibold text-sm transition-all hover:bg-muted w-full sm:w-auto"
                >
                  Browse artists
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {!loggedIn && (
          <p
            className="anim-fade-up mt-4 text-xs text-muted-foreground"
            style={{ animationDelay: "0.52s" }}
          >
            Or{" "}
            <Link href="/login" className="text-foreground underline underline-offset-2 hover:text-primary transition-colors">
              sign in with email
            </Link>
          </p>
        )}

        {/* Stats */}
        <div
          className="anim-fade-up mt-12 flex items-center gap-8"
          style={{ animationDelay: "0.58s" }}
        >
          <div className="text-center">
            <p className="text-2xl font-bold gradient-brand-text">Millions</p>
            <p className="text-xs text-muted-foreground mt-0.5">of Artists</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold gradient-brand-text">{stats.cityCount}+</p>
            <p className="text-xs text-muted-foreground mt-0.5">Cities</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold gradient-brand-text">
              {stats.totalVotes > 0 ? `${stats.totalVotes.toLocaleString()}+` : "0"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Votes cast</p>
          </div>
        </div>

        {/* Scrolling marquee */}
        <div
          className="anim-fade-up w-screen relative left-1/2 -translate-x-1/2"
          style={{ animationDelay: "0.65s" }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          <Marquee />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-6 py-32 max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="mb-20"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">How it works</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-xl leading-tight">
            Three steps to a show in your city.
          </h2>
        </motion.div>

        <div className="space-y-5">
          {HOW_IT_WORKS.map((step, i) => (
            <motion.div
              key={step.step}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i * 0.1}
              className="glass rounded-2xl p-8 flex items-start gap-6 group hover:border-primary/20 transition-all"
            >
              <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center shrink-0 glow-primary-sm group-hover:scale-105 transition-transform">
                <step.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-mono text-primary mb-2">{step.step}</p>
                <h3 className="text-xl font-bold mb-2 tracking-tight">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/30 mt-1 shrink-0 group-hover:text-primary transition-colors" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURE HIGHLIGHT ── */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-5">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="glass rounded-2xl p-8 md:col-span-2 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
            <Zap className="w-6 h-6 text-primary mb-4" />
            <h3 className="text-2xl font-bold tracking-tight mb-3">
              Real shows, not just data.
            </h3>
            <p className="text-muted-foreground leading-relaxed max-w-lg">
              When votes hit a venue threshold, Summon contacts the venue directly on behalf of the fans.
              We match artist demand to the right sized room — from intimate clubs to full arenas.
            </p>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Bar / Club", votes: "500" },
                { label: "Theatre", votes: "2,500" },
                { label: "Concert Hall", votes: "7,500" },
                { label: "Arena", votes: "25,000" },
              ].map((v) => (
                <div key={v.label} className="bg-muted/50 rounded-xl p-3 text-center">
                  <p className="text-primary font-bold text-sm">{v.votes}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{v.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0.1}
            className="glass rounded-2xl p-8 relative overflow-hidden"
          >
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-600/5 rounded-full blur-[60px] pointer-events-none" />
            <Music2 className="w-6 h-6 text-primary mb-4" />
            <h3 className="text-xl font-bold tracking-tight mb-2">One tap to vote.</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Browse our catalog, pick your city, and vote for the artists you want to see live. Every vote is counted and publicly visible.
            </p>
          </motion.div>

          <Link href="/submit">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0.15}
              className="glass rounded-2xl p-8 relative overflow-hidden hover:border-primary/20 transition-all cursor-pointer"
            >
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-pink-600/5 rounded-full blur-[60px] pointer-events-none" />
              <PlusCircle className="w-6 h-6 text-primary mb-4" />
              <h3 className="text-xl font-bold tracking-tight mb-2">Any artist, instantly.</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Can&apos;t find your favourite act? Search for them on the explore page — we pull from millions of artists and add them to the vote instantly.
              </p>
            </motion.div>
          </Link>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="px-6 py-32 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-5">
            Your city is{" "}
            <span className="gradient-brand-text">waiting.</span>
          </h2>
          <p className="text-muted-foreground mb-10 text-lg">
            Join fans already voting for their favourite shows.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/login">
              <Button
                size="lg"
                className="gradient-brand glow-primary border-0 text-white font-semibold text-base px-8 h-12 rounded-xl"
              >
                Start voting free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/explore">
              <Button
                size="lg"
                variant="outline"
                className="border-border/50 font-medium text-base h-12 rounded-xl px-8 hover:bg-muted"
              >
                Browse artists
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <span className="font-semibold gradient-brand-text">Summon</span>
        <div className="flex items-center gap-5">
          <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <a href="mailto:hello@wesummon.com" className="hover:text-foreground transition-colors">Contact</a>
        </div>
        <p>© 2026 Summon.</p>
      </footer>

    </div>
  );
}
