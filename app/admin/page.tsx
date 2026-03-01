"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, XCircle, Clock, Music2, MapPin,
  Instagram, ExternalLink, RefreshCw,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { fadeUp } from "@/lib/animations";
import Nav from "@/components/Nav";

type Submission = {
  id: string;
  type: "artist" | "venue";
  status: "pending" | "approved" | "rejected";
  artist_name?: string;
  artist_genre?: string;
  artist_subgenre?: string;
  artist_instagram?: string;
  artist_spotify?: string;
  venue_city?: string;
  venue_name?: string;
  venue_capacity?: string;
  deezer_validated?: boolean;
  deezer_image?: string;
  review_note?: string;
  created_at: string;
  reviewed_at?: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending:  "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  approved: "bg-green-500/15 text-green-400 border-green-500/20",
  rejected: "bg-red-500/15 text-red-400 border-red-500/20",
};

const CAPACITY_LABELS: Record<string, string> = {
  small:  "Bar / Club (~500)",
  medium: "Theatre (500–2k)",
  large:  "Concert Hall (2k–10k)",
  arena:  "Arena (10k+)",
};

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [reviewNote, setReviewNote] = useState<Record<string, string>>({});
  const [acting, setActing] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin");
    if (res.status === 403) { setForbidden(true); setLoading(false); return; }
    const data = await res.json();
    setSubmissions(data.submissions ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function decide(id: string, status: "approved" | "rejected") {
    setActing(id);
    await fetch("/api/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, review_note: reviewNote[id] ?? null }),
    });
    setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
    setActing(null);
  }

  if (forbidden) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="pt-32 text-center">
          <XCircle className="w-10 h-10 mx-auto mb-4 text-red-400 opacity-60" />
          <h1 className="text-2xl font-bold">Access denied</h1>
        </div>
      </div>
    );
  }

  const visible = submissions.filter((s) => filter === "all" || s.status === filter);
  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pt-24 pb-20 px-6 max-w-3xl mx-auto">

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Submissions</h1>
            {pendingCount > 0 && (
              <p className="text-muted-foreground mt-1 text-sm">{pendingCount} pending review</p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="text-muted-foreground">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </motion.div>

        {/* Filter tabs */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.05} className="flex gap-2 mb-6">
          {(["pending", "approved", "rejected", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                filter === f ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>No {filter === "all" ? "" : filter} submissions</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {visible.map((s, i) => (
              <motion.div
                key={s.id}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={0.08 + i * 0.04}
                className="glass rounded-2xl p-5"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    {s.type === "artist" && s.deezer_image ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 relative">
                        <Image src={s.deezer_image} alt={s.artist_name ?? ""} fill className="object-cover" sizes="48px" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center shrink-0">
                        {s.type === "artist" ? <Music2 className="w-5 h-5 text-white" /> : <MapPin className="w-5 h-5 text-white" />}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-base">{s.type === "artist" ? s.artist_name : s.venue_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {s.type === "artist"
                          ? [s.artist_genre, s.artist_subgenre].filter(Boolean).join(" · ")
                          : `${s.venue_city} · ${CAPACITY_LABELS[s.venue_capacity ?? ""] ?? s.venue_capacity}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Badge className={`text-xs ${STATUS_COLORS[s.status]}`}>{s.status}</Badge>
                    <Badge className="text-xs bg-muted text-muted-foreground border-border/40 capitalize">{s.type}</Badge>
                  </div>
                </div>

                {/* Artist extras */}
                {s.type === "artist" && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {s.deezer_validated !== undefined && (
                      <Badge className={s.deezer_validated
                        ? "bg-green-500/15 text-green-400 border-green-500/20 text-xs"
                        : "bg-yellow-500/15 text-yellow-400 border-yellow-500/20 text-xs"}>
                        {s.deezer_validated ? "✓ Deezer verified" : "⚠ Not found on Deezer"}
                      </Badge>
                    )}
                    {s.artist_instagram && (
                      <a href={`https://instagram.com/${s.artist_instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <Instagram className="w-3 h-3" /> {s.artist_instagram}
                      </a>
                    )}
                    {s.artist_spotify && (
                      <a href={s.artist_spotify} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <ExternalLink className="w-3 h-3" /> Spotify
                      </a>
                    )}
                  </div>
                )}

                <p className="text-xs text-muted-foreground mb-3">
                  Submitted {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>

                {/* Review actions */}
                {s.status === "pending" && (
                  <div className="space-y-2">
                    <Input
                      placeholder="Review note (optional)"
                      value={reviewNote[s.id] ?? ""}
                      onChange={(e) => setReviewNote((prev) => ({ ...prev, [s.id]: e.target.value }))}
                      className="bg-muted/50 border-0 rounded-xl h-9 text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => decide(s.id, "approved")}
                        disabled={acting === s.id}
                        className="flex-1 gradient-brand border-0 text-white rounded-lg h-9 text-sm font-semibold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => decide(s.id, "rejected")}
                        disabled={acting === s.id}
                        className="flex-1 text-red-400 hover:bg-red-500/10 rounded-lg h-9 text-sm"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1.5" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}

                {s.review_note && (
                  <p className="mt-2 text-xs text-muted-foreground italic">Note: {s.review_note}</p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
