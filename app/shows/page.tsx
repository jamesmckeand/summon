"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Ticket, CalendarDays, MapPin, Music2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/animations";
import Nav from "@/components/Nav";

type Show = {
  id: string;
  artistId: string;
  artistName: string;
  venue: string;
  city: string;
  country: string;
  date: string;
  ticketUrl: string;
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

export default function ShowsPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shows")
      .then((r) => r.json())
      .then((data) => setShows(data.shows ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pt-24 pb-20 px-6 max-w-3xl mx-auto">

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest text-green-400">Live on Ticketmaster</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Confirmed Shows</h1>
          <p className="mt-1 text-muted-foreground">
            Upcoming shows for the most voted artists on Summon.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass rounded-xl p-5 h-24 animate-pulse bg-muted/20" />
            ))}
          </div>
        ) : shows.length === 0 ? (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0.1} className="text-center py-20">
            <Ticket className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground mb-4">No confirmed shows right now.</p>
            <p className="text-sm text-muted-foreground mb-6">
              Keep voting — when enough fans vote for an artist, we reach out to venues to make it happen.
            </p>
            <Link href="/explore">
              <Button className="gradient-brand border-0 text-white">Browse artists</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            {shows.map((show, i) => (
              <motion.div
                key={show.id}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={0.05 + Math.min(i, 15) * 0.03}
                className="glass rounded-xl p-5 hover:border-green-500/20 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Ticket className="w-4 h-4 text-green-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link href={`/artist/${show.artistId}`} className="font-bold text-base hover:text-primary transition-colors">
                          {show.artistName}
                        </Link>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {show.venue}, {show.city}
                            {show.country && show.country !== "United States Of America" && show.country !== "Canada"
                              ? `, ${show.country}` : ""}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <CalendarDays className="w-3 h-3" />
                            {formatDate(show.date)}
                          </span>
                        </div>
                      </div>
                      <a
                        href={show.ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <Button
                          size="sm"
                          className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0 rounded-lg h-8 px-3 text-xs font-semibold"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Tickets
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0.3}
              className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1"
            >
              <Music2 className="w-3 h-3" />
              Shows sourced from Ticketmaster for the top voted artists on Summon
            </motion.p>
          </div>
        )}
      </div>
    </div>
  );
}
