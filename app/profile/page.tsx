"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  MapPin, Mail, Bell, Check, Star,
  Pencil, Save, X, LogOut, Trash2, ExternalLink, Shield,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fadeUp } from "@/lib/animations";
import { ARTISTS } from "@/lib/data/artists";
import CityDropdown from "@/components/CityDropdown";
import AppleMusicConnect from "@/components/AppleMusicConnect";
import { useVoteStore } from "@/lib/store/votes";
import { createClient } from "@/lib/supabase/client";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import UserAvatar from "@/components/UserAvatar";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type Profile = {
  username: string | null;
  city: string | null;
  notifications_email: boolean;
  notifications_push: boolean;
};

type DbVote = { artist_id: string; city: string };
type Identity = { provider: string };

const PROVIDER_LABELS: Record<string, string> = {
  email: "Email / Magic link",
  google: "Google",
  twitter: "X (Twitter)",
  facebook: "Facebook",
  spotify: "Spotify",
  apple: "Apple",
};

function Toggle({ enabled, onChange, disabled }: { enabled: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
        enabled ? "gradient-brand" : "bg-muted/60"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${enabled ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { votes } = useVoteStore();

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [profile, setProfile] = useState<Profile>({ username: null, city: null, notifications_email: true, notifications_push: true });
  const [loading, setLoading] = useState(true);
  const [dbVotes, setDbVotes] = useState<DbVote[]>([]);
  const [isSuperfan, setIsSuperfan] = useState(false);
  const [appleMusicConnected, setAppleMusicConnected] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/login"); return; }
      setUser(data.user);
      setIdentities((data.user.identities ?? []) as Identity[]);
    });

    Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/votes").then((r) => r.json()),
    ]).then(([profileData, votesData]) => {
      if (profileData.profile) {
        setProfile({
          username: profileData.profile.username ?? null,
          city: profileData.profile.city ?? null,
          notifications_email: profileData.profile.notifications_email !== false,
          notifications_push: profileData.profile.notifications_push !== false,
        });
        setUsernameInput(profileData.profile.username ?? "");
      }
      if (votesData.votes) setDbVotes(votesData.votes);
    }).catch(() => {}).finally(() => setLoading(false));

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", data.user.id)
        .eq("status", "active")
        .maybeSingle();
      setIsSuperfan(!!sub);
    });
  }, [router]);

  async function patch(updates: Record<string, unknown>) {
    const key = Object.keys(updates)[0];
    setSaving(key);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) setProfile((prev) => ({ ...prev, ...updates }));
    } catch { /* network failure */ }
    setSaving(null);
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
  }

  async function saveUsername() {
    await patch({ username: usernameInput.trim() || null });
    setEditingUsername(false);
  }

  async function manageSubscription() {
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch { /* ignore */ }
  }

  async function signOut() {
    setSigningOut(true);
    await createClient().auth.signOut();
    router.push("/");
  }

  const displayName = profile.username || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  const totalVotes = dbVotes.length || Object.values(votes).reduce((sum, ids) => sum + ids.length, 0);
  const citiesVotedIn = dbVotes.length
    ? new Set(dbVotes.map((v) => v.city)).size
    : Object.entries(votes).filter(([, ids]) => ids.length > 0).length;

  const votesByCity = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const { artist_id, city } of dbVotes) {
      if (!map[city]) map[city] = [];
      map[city].push(artist_id);
    }
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
  }, [dbVotes]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="pt-32 flex justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full opacity-20"
        style={{ background: "radial-gradient(ellipse at top, oklch(0.58 0.22 264 / 40%) 0%, transparent 70%)" }} />

      <div className="pt-24 pb-20 px-6 max-w-2xl mx-auto">

        {/* Page header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="mb-8">
          <div className="flex items-center gap-4 mb-5">
            <div className="p-0.5 rounded-2xl gradient-brand shrink-0">
              <UserAvatar
                name={displayName}
                src={user?.user_metadata?.avatar_url}
                size={60}
                rounded="rounded-[14px]"
                textSize="text-xl"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary/70 mb-0.5">Your profile</p>
              <h1 className="text-2xl font-bold tracking-tight truncate">{displayName}</h1>
              {user?.email && <p className="text-sm text-muted-foreground truncate">{user.email}</p>}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <span className="text-2xl font-extrabold gradient-brand-text tabular-nums">{totalVotes}</span>
              <span className="text-xs text-muted-foreground ml-1.5">votes</span>
            </div>
            <div className="w-px h-5 bg-border" />
            <div>
              <span className="text-2xl font-extrabold gradient-brand-text tabular-nums">{citiesVotedIn}</span>
              <span className="text-xs text-muted-foreground ml-1.5">cities</span>
            </div>
          </div>
        </motion.div>


        {/* Profile — username + home city in one card */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.08} className="glass rounded-2xl p-5 mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">Profile</p>

          {/* Username */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs text-muted-foreground">Username</p>
              {!editingUsername && (
                <button onClick={() => { setEditingUsername(true); setUsernameInput(profile.username ?? ""); }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Edit username">
                  <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
            {editingUsername ? (
              <div className="flex gap-2">
                <Input
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="flex-1 bg-muted/50 border-0 rounded-lg h-9"
                  autoFocus maxLength={50}
                  onKeyDown={(e) => { if (e.key === "Enter") saveUsername(); if (e.key === "Escape") setEditingUsername(false); }}
                />
                <Button size="sm" onClick={saveUsername} disabled={saving === "username"} className="gradient-brand border-0 text-white rounded-lg h-9 px-3" aria-label="Save username">
                  <Save className="w-3.5 h-3.5" aria-hidden="true" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingUsername(false)} className="rounded-lg h-9 px-3" aria-label="Cancel edit">
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </Button>
              </div>
            ) : (
              <p className="font-medium text-sm">{profile.username || <span className="text-muted-foreground italic">Not set</span>}</p>
            )}
          </div>

          <div className="w-full h-px bg-border mb-4" />

          {/* Home city */}
          <div className="relative z-20">
            <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" />Home City
            </p>
            <CityDropdown value={profile.city ?? ""} onChange={(city) => patch({ city })} />
          </div>
        </motion.div>

        {/* Vote history */}
        {votesByCity.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.12} className="glass rounded-2xl p-5 mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">Vote History</p>
            <div className="flex flex-col gap-4">
              {votesByCity.map(([city, artistIds]) => (
                <div key={city}>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <p className="text-sm font-semibold">{city}</p>
                    <span className="text-xs text-muted-foreground ml-auto">{artistIds.length} vote{artistIds.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {artistIds.map((id) => {
                      const a = ARTISTS.find((a) => a.id === id);
                      if (!a) return null;
                      return (
                        <Link key={id} href={`/artist/${id}`}
                          className="px-2.5 py-1 rounded-full glass text-xs font-medium hover:border-primary/40 hover:text-primary transition-colors">
                          {a.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Apple Music */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.16} className="glass rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#fc3c44]/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[#fc3c44]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Apple Music</p>
                <p className="text-xs text-muted-foreground">
                  {appleMusicConnected ? "Artists imported to your For You feed" : "Import your artists for personalised picks"}
                </p>
              </div>
            </div>
            {appleMusicConnected ? (
              <Badge className="bg-green-500/15 text-green-400 border-green-500/20 text-xs shrink-0">
                <Check className="w-3 h-3 mr-1" /> Connected
              </Badge>
            ) : (
              <AppleMusicConnect
                onArtists={(artists) => {
                  patch({ favourite_artists: artists.map((a) => a.id) });
                  setAppleMusicConnected(true);
                }}
                className="shrink-0 px-3 py-1.5 rounded-lg glass text-xs font-medium hover:border-primary/30 transition-colors"
                label="Connect"
              />
            )}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.2} className="glass rounded-2xl p-5 mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">Notifications</p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs text-muted-foreground">Threshold alerts and vote milestones</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {saved === "notifications_email" && <Check className="w-3.5 h-3.5 text-green-400" />}
                <Toggle enabled={profile.notifications_email} disabled={saving === "notifications_email"} onChange={(v) => patch({ notifications_email: v })} />
              </div>
            </div>
            <div className="w-full h-px bg-border" />
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Push</p>
                  <p className="text-xs text-muted-foreground">Live alerts on your device</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {saved === "notifications_push" && <Check className="w-3.5 h-3.5 text-green-400" />}
                <Toggle enabled={profile.notifications_push} disabled={saving === "notifications_push"} onChange={(v) => patch({ notifications_push: v })} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account — connected providers + actions merged */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.25} className="glass rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">Account</p>

          {identities.length > 0 && (
            <div className="flex flex-col gap-1 mb-3">
              {identities.map((identity) => (
                <div key={identity.provider} className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-muted/30">
                  <p className="text-sm font-medium">{PROVIDER_LABELS[identity.provider] ?? identity.provider}</p>
                  <Badge className="bg-green-500/15 text-green-400 border-green-500/20 text-xs">
                    <Check className="w-3 h-3 mr-1" /> Connected
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {identities.length > 0 && <div className="w-full h-px bg-border mb-2" />}

          <div className="flex flex-col gap-1">
            {isSuperfan ? (
              <button onClick={manageSubscription} className="flex items-center gap-3 px-3 h-10 rounded-xl w-full text-left hover:bg-muted/30 transition-colors">
                <Star className="w-4 h-4 text-yellow-400 shrink-0" />
                <span className="text-sm text-muted-foreground">Superfan</span>
                <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/20 text-xs">Active</Badge>
                <span className="text-xs text-muted-foreground ml-auto opacity-50">Manage</span>
              </button>
            ) : (
              <Link href="/superfan" className="flex items-center gap-3 px-3 h-10 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Star className="w-4 h-4 shrink-0" />
                Superfan <span className="text-xs ml-1 opacity-60">$4/mo</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
              </Link>
            )}
            <a href="/privacy" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 h-10 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Shield className="w-4 h-4 shrink-0" />Privacy Policy<ExternalLink className="w-3 h-3 ml-auto opacity-50" />
            </a>
            <Button onClick={signOut} disabled={signingOut} variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground h-10 rounded-xl px-3">
              <LogOut className="w-4 h-4 shrink-0" />
              {signingOut ? "Signing out…" : "Sign out"}
            </Button>
            <a href="mailto:hello@wesummon.com?subject=Delete my account"
              className="flex items-center gap-3 px-3 h-10 rounded-xl text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <Trash2 className="w-4 h-4 shrink-0" />Delete account
            </a>
          </div>
        </motion.div>

      </div>
      <Footer />
    </div>
  );
}
