"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  pendingVote?: { artistId: string; city: string } | null;
}

export default function AuthModal({ open, onClose, pendingVote }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function handleClose() {
    onClose();
    setSent(false);
    setEmail("");
    setError("");
  }

  async function handleSubmit() {
    if (!email) return;
    setLoading(true);
    setError("");
    if (pendingVote) {
      localStorage.setItem("summon-pending-vote", JSON.stringify(pendingVote));
    }
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (err) setError(err.message);
    else setSent(true);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative glass rounded-2xl p-6 w-full max-w-sm z-10"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {sent ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <CheckCircle className="w-12 h-12 text-primary" />
                <p className="font-bold text-lg">Check your email</p>
                <p className="text-sm text-muted-foreground text-center">
                  Click the magic link to sign in — your vote will be cast automatically.
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-xl mb-1 text-center">Sign in to vote</h3>
                <p className="text-sm text-muted-foreground text-center mb-5">
                  Enter your email and we&apos;ll send a magic link. Your vote will be cast
                  automatically after you sign in.
                </p>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="h-12 rounded-xl bg-muted/50 border-border/60 text-center mb-3"
                />
                <Button
                  size="lg"
                  onClick={handleSubmit}
                  disabled={loading || !email}
                  className="w-full h-12 rounded-xl gradient-brand border-0 text-white font-semibold"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send magic link"}
                </Button>
                {error && <p className="text-xs text-destructive mt-2 text-center">{error}</p>}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
