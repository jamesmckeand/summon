"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Music2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fadeUp } from "@/lib/animations";
import { createClient } from "@/lib/supabase/client";
import Nav from "@/components/Nav";
import ArtistForm from "./_components/ArtistForm";
import VenueForm from "./_components/VenueForm";

type Tab = "artist" | "venue";
type Result = { ok: true; validated?: boolean; type: Tab };

export default function SubmitPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("artist");
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setAuthed(!!data.user));
  }, []);

  if (authed === false) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="pt-32 text-center px-6">
          <Music2 className="w-10 h-10 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h1 className="text-2xl font-bold mb-2">Sign in to submit</h1>
          <p className="text-muted-foreground mb-6">You need an account to suggest artists or venues.</p>
          <Button className="gradient-brand border-0 text-white" onClick={() => router.push("/login")}>
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pt-24 pb-20 px-6 max-w-xl mx-auto">

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary/70 mb-2">Community</p>
          <h1 className="text-3xl font-bold tracking-tight">Suggest an addition</h1>
          <p className="text-muted-foreground mt-1">
            Know an artist or venue we're missing? Let us know — we review every submission.
          </p>
        </motion.div>

        {/* Tab switcher */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.05} className="flex gap-2 mb-6">
          {(["artist", "venue"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setResult(null); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t ? "gradient-brand text-white border-0" : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "artist" ? "Artist" : "Venue"}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-8 text-center"
            >
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Submitted — thanks!</h2>
              {result.type === "artist" && (
                <p className="text-muted-foreground text-sm mb-1">
                  {result.validated
                    ? "✓ Verified on Deezer — this artist looks real."
                    : "We couldn't auto-verify this artist, but we'll review manually."}
                </p>
              )}
              <p className="text-muted-foreground text-sm">
                We'll review it and add it to the app if it's a good fit.
              </p>
              <div className="mt-6 flex gap-3 justify-center flex-wrap">
                <Button className="gradient-brand border-0 text-white" onClick={() => setResult(null)}>
                  Submit another
                </Button>
                <Link href="/explore">
                  <Button variant="outline" className="border-border/50">Explore artists</Button>
                </Link>
              </div>
            </motion.div>
          ) : tab === "artist" ? (
            <motion.div key="artist" initial="hidden" animate="visible" variants={fadeUp} custom={0.1}>
              <ArtistForm onSuccess={(validated) => setResult({ ok: true, validated, type: "artist" })} />
            </motion.div>
          ) : (
            <motion.div key="venue" initial="hidden" animate="visible" variants={fadeUp} custom={0.1}>
              <VenueForm onSuccess={() => setResult({ ok: true, type: "venue" })} />
            </motion.div>
          )}
        </AnimatePresence>

        {!result && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.3} className="mt-8 flex items-center justify-center gap-2">
            <Badge className="bg-muted text-muted-foreground border-border/40 text-xs">
              All submissions are reviewed before going live
            </Badge>
          </motion.div>
        )}
      </div>
    </div>
  );
}
