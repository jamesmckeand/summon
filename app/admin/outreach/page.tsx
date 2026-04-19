"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Mail, User, Building2, RefreshCw, XCircle,
  ChevronRight, ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fadeUp } from "@/lib/animations";
import Nav from "@/components/Nav";

type ContactLog = {
  id: string;
  artist_id: string;
  artist_name: string;
  city: string;
  threshold: number;
  tier: string;
  vote_count: number;
  manager_name: string | null;
  manager_email: string | null;
  booking_agent_name: string | null;
  booking_agent_email: string | null;
  agency: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type PromoterSend = {
  id: string;
  artist_id: string;
  artist_name: string;
  city: string;
  threshold: number;
  promoter_id: string;
  venue_name: string;
  status: string;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  new:     "bg-blue-500/15 text-blue-400 border-blue-500/20",
  sent:    "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  replied: "bg-primary/15 text-primary border-primary/20",
  booked:  "bg-green-500/15 text-green-400 border-green-500/20",
  no_contact: "bg-muted/60 text-muted-foreground border-border/40",
};

const STATUSES = ["new", "sent", "replied", "booked", "no_contact"];

export default function AdminOutreachPage() {
  const [tab, setTab] = useState<"contacts" | "promoters">("contacts");
  const [contacts, setContacts] = useState<ContactLog[]>([]);
  const [promoterSends, setPromoterSends] = useState<PromoterSend[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/outreach");
    if (res.status === 403) { setForbidden(true); setLoading(false); return; }
    const data = await res.json();
    setContacts(data.contacts ?? []);
    setPromoterSends(data.promoterSends ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(table: "artist_contact_log" | "outreach_log", id: string, status: string) {
    setUpdating(id);
    await fetch("/api/admin/outreach", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table, id, updates: { status } }),
    });
    if (table === "artist_contact_log") {
      setContacts((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
    } else {
      setPromoterSends((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
    }
    setUpdating(null);
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

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pt-24 pb-20 px-6 max-w-4xl mx-auto">

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
          className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/admin" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                Submissions <ChevronRight className="w-3 h-3" />
              </Link>
              <span className="text-xs text-foreground font-medium">Outreach</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Outreach Pipeline</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="text-muted-foreground">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.05}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Artist contacts", value: contacts.length },
            { label: "Promoter sends", value: promoterSends.length },
            { label: "Replied", value: [...contacts, ...promoterSends].filter((x) => x.status === "replied").length },
            { label: "Booked", value: [...contacts, ...promoterSends].filter((x) => x.status === "booked").length },
          ].map((stat) => (
            <div key={stat.label} className="card-solid rounded-2xl p-4 text-center">
              <p className="text-2xl font-extrabold gradient-brand-text tabular-nums leading-none">{stat.value}</p>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary/70 mt-1.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.08}
          className="flex gap-2 mb-6">
          {(["contacts", "promoters"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                tab === t ? "gradient-brand text-white border-0" : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "contacts" ? `Artist Contacts (${contacts.length})` : `Promoter Sends (${promoterSends.length})`}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : tab === "contacts" ? (
          <div className="flex flex-col gap-3">
            {contacts.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Mail className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p>No artist contact logs yet</p>
              </div>
            ) : contacts.map((c, i) => (
              <motion.div key={c.id} initial="hidden" animate="visible" variants={fadeUp} custom={0.1 + i * 0.02}
                className="glass rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/artist/${c.artist_id}`}
                        className="font-bold hover:text-primary transition-colors">{c.artist_name}</Link>
                      <span className="text-muted-foreground text-sm">·</span>
                      <span className="text-sm text-muted-foreground">{c.city}</span>
                      <Badge className={`text-xs ${STATUS_COLORS[c.status] ?? STATUS_COLORS.new}`}>{c.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {c.vote_count.toLocaleString()} votes · {c.tier} tier ·{" "}
                      {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <Link href={`/live/${c.artist_id}/${c.city.toLowerCase().replace(/\s+/g, "-")}`} target="_blank"
                    className="shrink-0 text-muted-foreground hover:text-primary transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>

                {/* Contact info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {(c.booking_agent_name || c.booking_agent_email) && (
                    <div className="rounded-xl bg-primary/5 border border-primary/10 px-3 py-2">
                      <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> Booking Agent
                      </p>
                      {c.booking_agent_name && <p className="text-sm font-medium">{c.booking_agent_name}</p>}
                      {c.agency && <p className="text-xs text-muted-foreground">{c.agency}</p>}
                      {c.booking_agent_email && (
                        <a href={`mailto:${c.booking_agent_email}`}
                          className="text-xs text-primary hover:underline">{c.booking_agent_email}</a>
                      )}
                    </div>
                  )}
                  {(c.manager_name || c.manager_email) && (
                    <div className="rounded-xl bg-primary/5 border border-primary/10 px-3 py-2">
                      <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                        <User className="w-3 h-3" /> Manager
                      </p>
                      {c.manager_name && <p className="text-sm font-medium">{c.manager_name}</p>}
                      {c.manager_email && (
                        <a href={`mailto:${c.manager_email}`}
                          className="text-xs text-primary hover:underline">{c.manager_email}</a>
                      )}
                    </div>
                  )}
                  {!c.booking_agent_name && !c.booking_agent_email && !c.manager_name && !c.manager_email && (
                    <p className="text-xs text-muted-foreground italic col-span-2">No contact info found yet</p>
                  )}
                </div>

                {/* Status update */}
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.filter((s) => s !== c.status).map((s) => (
                    <button
                      key={s}
                      disabled={updating === c.id}
                      onClick={() => updateStatus("artist_contact_log", c.id, s)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium glass hover:border-primary/30 hover:text-primary transition-all capitalize"
                    >
                      → {s.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {promoterSends.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Mail className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p>No promoter outreach sent yet</p>
              </div>
            ) : promoterSends.map((s, i) => (
              <motion.div key={s.id} initial="hidden" animate="visible" variants={fadeUp} custom={0.1 + i * 0.02}
                className="glass rounded-2xl p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/artist/${s.artist_id}`}
                      className="font-semibold text-sm hover:text-primary transition-colors">{s.artist_name}</Link>
                    <span className="text-muted-foreground text-xs">→</span>
                    <span className="text-sm font-medium">{s.venue_name}</span>
                    <Badge className={`text-xs ${STATUS_COLORS[s.status] ?? STATUS_COLORS.sent}`}>{s.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {s.city} · {s.threshold.toLocaleString()} votes ·{" "}
                    {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {["replied", "booked"].filter((st) => st !== s.status).map((st) => (
                    <button
                      key={st}
                      disabled={updating === s.id}
                      onClick={() => updateStatus("outreach_log", s.id, st)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium glass hover:border-primary/30 hover:text-primary transition-all capitalize"
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
