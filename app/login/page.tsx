"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Music2, Headphones, CheckCircle, Loader2 } from "lucide-react";
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
        scopes: "user-read-email user-read-private user-top-read",
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

  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function signInWithTwitter() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "twitter",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function signInWithFacebook() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
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
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-5 h-5 mr-2" />}
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

                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-border/50" />
                  <span className="text-xs text-muted-foreground">or continue with</span>
                  <div className="flex-1 h-px bg-border/50" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Google */}
                  <Button
                    size="lg"
                    onClick={signInWithGoogle}
                    className="h-12 rounded-xl bg-white hover:bg-gray-100 text-black font-semibold border-0 transition-all text-sm"
                  >
                    <svg className="w-4 h-4 mr-2 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </Button>

                  {/* X / Twitter */}
                  <Button
                    size="lg"
                    onClick={signInWithTwitter}
                    className="h-12 rounded-xl bg-black hover:bg-zinc-900 text-white font-semibold border-0 transition-all text-sm"
                  >
                    <svg className="w-4 h-4 mr-2 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    X / Twitter
                  </Button>

                  {/* Facebook */}
                  <Button
                    size="lg"
                    onClick={signInWithFacebook}
                    className="col-span-2 h-12 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold border-0 transition-all text-sm"
                  >
                    <svg className="w-4 h-4 mr-2 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </Button>
                </div>
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
