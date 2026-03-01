"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Music2, Headphones, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fadeUp } from "@/lib/animations";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleMagicLink() {
    if (!email) return;
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  async function signInWithSpotify() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "spotify",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "user-read-email user-read-private",
      },
    });
  }

  async function signInWithApple() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={0}
        className="relative w-full max-w-sm"
      >
        <div className="glass rounded-2xl p-8 text-center">
          <motion.div variants={fadeUp} custom={0.1}>
            <span className="text-2xl font-bold gradient-brand-text">Summon</span>
            <h1 className="mt-6 text-2xl font-bold tracking-tight">Join the movement</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to start voting for shows in your city.
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex flex-col items-center gap-3"
              >
                <CheckCircle className="w-12 h-12 text-primary" />
                <p className="font-semibold">Check your email</p>
                <p className="text-sm text-muted-foreground">
                  We sent a magic link to <span className="text-foreground">{email}</span>. Click it to sign in.
                </p>
              </motion.div>
            ) : (
              <motion.div key="form" variants={fadeUp} custom={0.2} className="mt-8 flex flex-col gap-3">
                {/* Email magic link */}
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleMagicLink()}
                  className="h-12 rounded-xl bg-muted/50 border-border/60 text-center"
                />
                <Button
                  size="lg"
                  onClick={handleMagicLink}
                  disabled={loading || !email}
                  className="w-full h-12 rounded-xl gradient-brand border-0 text-white font-semibold glow-primary-sm"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  {loading ? "Sending..." : "Continue with Email"}
                </Button>

                {error && <p className="text-xs text-destructive">{error}</p>}

                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-border/50" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="flex-1 h-px bg-border/50" />
                </div>

                {/* Spotify */}
                <Button
                  size="lg"
                  onClick={signInWithSpotify}
                  className="w-full h-12 rounded-xl bg-[#1DB954] hover:bg-[#1aa34a] text-black font-semibold border-0 transition-all"
                >
                  <Music2 className="w-5 h-5 mr-2" />
                  Continue with Spotify
                </Button>

                {/* Apple */}
                <Button
                  size="lg"
                  onClick={signInWithApple}
                  className="w-full h-12 rounded-xl bg-white hover:bg-gray-100 text-black font-semibold border-0 transition-all"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                  </svg>
                  Continue with Apple
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.p
            variants={fadeUp}
            custom={0.3}
            className="mt-6 text-xs text-muted-foreground leading-relaxed"
          >
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
