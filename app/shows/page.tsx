"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Ticket, Music2, ExternalLink, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fadeUp } from "@/lib/animations";
import Nav from "@/components/Nav";
import { ARTISTS } from "@/lib/data/artists";

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

type ArtistGroup = {
  artistId: string;
  artistName: string;
  genre: string;
  subgenre?: string;
  shows: Show[];
};

function parsedDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return {
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: d.getDate(),
    full: d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  };
}

function daysUntil(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const show = new Date(dateStr + "T00:00:00");
  return Math.round((show.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function UrgencyBadge({ days }: { days: number }) {
  if (days === 0)
    return <Badge className="bg-red-500/15 text-red-400 border-red-500/20 text-[10px] px-1.5 py-0">Today</Badge>;
  if (days === 1)
    return <Badge className="bg-orange-500/15 text-orange-400 border-orange-500/20 text-[10px] px-1.5 py-0">Tomorrow</Badge>;
  if (days <= 7)
    return <Badge className="bg-primary/15 text-primary border-primary/20 text-[10px] px-1.5 py-0">In {days} days</Badge>;
  return null;
}

function showLocation(show: Show) {
  const parts = [show.venue];
  if (show.city && show.city !== "TBA") parts.push(show.city);
  if (
    show.country &&
    show.country !== "United States Of America" &&
    show.country !== "Canada"
  )
    parts.push(show.country);
  return parts.join(", ");
}

const PAGE_SIZE = 10; // artist-groups per page

export default function ShowsPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<Record<string, string | null>>({});
  const [cityFilter, setCityFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [favouriteArtistIds, setFavouriteArtistIds] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/shows")
      .then((r) => r.json())
      .then((data) => setShows(data.shows ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch("/api/artist-images")
      .then((r) => r.json())
      .then((data) => { if (data.images) setImages(data.images); })
      .catch(() => {});

    // Silently fetch user's favourite artists — ignored if not logged in
    fetch("/api/profile")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.profile?.favourite_artists?.length) {
          setFavouriteArtistIds(data.profile.favourite_artists);
        }
      })
      .catch(() => {});
  }, []);

  // Group shows by artist, preserving date-sort within each group
  const artistGroups = useMemo<ArtistGroup[]>(() => {
    const map: Record<string, ArtistGroup> = {};
    for (const show of shows) {
      if (!map[show.artistId]) {
        const meta = ARTISTS.find((a) => a.id === show.artistId);
        map[show.artistId] = {
          artistId: show.artistId,
          artistName: show.artistName,
          genre: meta?.genre ?? "",
          subgenre: meta?.subgenre,
          shows: [],
        };
      }
      map[show.artistId].shows.push(show);
    }

    const favSet = new Set(favouriteArtistIds);

    return Object.values(map).sort((a, b) => {
      const aFav = favSet.has(a.artistId);
      const bFav = favSet.has(b.artistId);
      // 1. Favourites always first
      if (aFav !== bFav) return aFav ? -1 : 1;
      // 2. More confirmed shows = more popular / active tour
      if (b.shows.length !== a.shows.length) return b.shows.length - a.shows.length;
      // 3. Earliest show date as tiebreaker
      return new Date(a.shows[0].date).getTime() - new Date(b.shows[0].date).getTime();
    });
  }, [shows, favouriteArtistIds]);

  // All cities that appear in the current show list
  const cities = useMemo(() => {
    const set = new Set<string>();
    for (const show of shows) if (show.city && show.city !== "TBA") set.add(show.city);
    return Array.from(set).sort();
  }, [shows]);

  // Apply city filter
  const filteredGroups = useMemo(() => {
    if (cityFilter === "All") return artistGroups;
    return artistGroups
      .map((g) => ({ ...g, shows: g.shows.filter((s) => s.city === cityFilter) }))
      .filter((g) => g.shows.length > 0);
  }, [artistGroups, cityFilter]);

  // Reset pagination when filter changes
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [cityFilter]);

  const visibleGroups = filteredGroups.slice(0, visibleCount);
  const hasMore = visibleCount < filteredGroups.length;
  const remaining = filteredGroups.length - visibleCount;
  const filteredShowCount = filteredGroups.reduce((acc, g) => acc + g.shows.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pt-24 pb-20 px-6 max-w-3xl mx-auto">

        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest text-green-400">Live dates</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Confirmed Shows</h1>
          <p className="mt-1 text-muted-foreground">
            {loading
              ? "Loading shows…"
              : filteredShowCount > 0
                ? <>
                    <span className="text-foreground font-medium">{filteredShowCount}</span>
                    {" upcoming show"}{filteredShowCount !== 1 ? "s" : ""}
                    {cityFilter !== "All" ? <> in <span className="text-foreground font-medium">{cityFilter}</span></> : ""}
                    {" across "}
                    <span className="text-foreground font-medium">{filteredGroups.length}</span>
                    {" artist"}{filteredGroups.length !== 1 ? "s" : ""}
                  </>
                : cityFilter !== "All"
                  ? `No upcoming shows in ${cityFilter}.`
                  : "No confirmed shows right now."
            }
          </p>
        </motion.div>

        {/* City filter pills */}
        {!loading && cities.length > 1 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.05}
            className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide"
          >
            {["All", ...cities].map((city) => (
              <button
                key={city}
                onClick={() => setCityFilter(city)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  cityFilter === city
                    ? "gradient-brand text-white border-transparent glow-primary-sm"
                    : "glass text-muted-foreground hover:text-foreground border-border/40"
                }`}
              >
                {city}
              </button>
            ))}
          </motion.div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
                {/* Artist header skeleton */}
                <div className="flex items-center gap-4 p-5 pb-4">
                  <div className="w-14 h-14 rounded-xl bg-muted/60 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted/60 rounded w-40" />
                    <div className="h-3 bg-muted/60 rounded w-24" />
                  </div>
                </div>
                {/* Show row skeletons */}
                <div className="border-t border-border/40 divide-y divide-border/40">
                  {Array.from({ length: i === 0 ? 2 : 1 }).map((_, j) => (
                    <div key={j} className="flex items-center gap-4 px-5 py-3.5">
                      <div className="w-10 space-y-1 shrink-0">
                        <div className="h-2.5 bg-muted/60 rounded w-8" />
                        <div className="h-5 bg-muted/60 rounded w-6" />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 bg-muted/60 rounded w-48" />
                        <div className="h-3 bg-muted/60 rounded w-32" />
                      </div>
                      <div className="w-16 h-8 bg-muted/60 rounded-lg shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        ) : filteredGroups.length === 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.1}
            className="text-center py-20"
          >
            <Ticket className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground mb-2">
              {cityFilter !== "All"
                ? `No shows in ${cityFilter} right now.`
                : "No confirmed shows right now."}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Keep voting — when enough fans vote for an artist, we reach out to venues to make it happen.
            </p>
            {cityFilter !== "All" ? (
              <Button variant="ghost" onClick={() => setCityFilter("All")} className="mr-2">
                Show all cities
              </Button>
            ) : null}
            <Link href="/explore">
              <Button className="gradient-brand border-0 text-white">Browse artists</Button>
            </Link>
          </motion.div>

        ) : (
          <div className="flex flex-col gap-4">
            {visibleGroups.map((group, gi) => {
              const img = images[group.artistName] ?? null;
              const isFavourite = favouriteArtistIds.includes(group.artistId);
              const initials = group.artistName
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <motion.div
                  key={group.artistId}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  custom={0.08 + Math.min(gi, 8) * 0.04}
                  className={`glass rounded-2xl overflow-hidden ${isFavourite ? "border-primary/30" : ""}`}
                >
                  {/* Artist header */}
                  <Link href={`/artist/${group.artistId}`}>
                    <div className="flex items-center gap-4 p-5 pb-4 hover:bg-white/[0.025] transition-colors group">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 relative">
                        {img ? (
                          <Image
                            src={img}
                            alt={group.artistName}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="56px"
                          />
                        ) : (
                          <div className="w-full h-full gradient-brand flex items-center justify-center">
                            <span className="text-white font-bold text-base">{initials}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-base leading-tight group-hover:text-primary transition-colors">
                            {group.artistName}
                          </p>
                          {isFavourite && (
                            <Star className="w-3.5 h-3.5 text-primary fill-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {group.subgenre
                            ? `${group.genre} · ${group.subgenre}`
                            : group.genre}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {group.shows.length} {group.shows.length === 1 ? "show" : "shows"}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </Link>

                  {/* Show rows */}
                  <div className="border-t border-border/40 divide-y divide-border/40">
                    {group.shows.map((show) => {
                      const { month, day, full } = parsedDate(show.date);
                      const days = daysUntil(show.date);

                      return (
                        <div
                          key={show.id}
                          className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.015] transition-colors"
                        >
                          {/* Calendar date block */}
                          <div className="text-center w-10 shrink-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-primary leading-none mb-0.5">
                              {month}
                            </p>
                            <p className="text-xl font-extrabold leading-none">{day}</p>
                          </div>

                          {/* Venue + date */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-medium truncate">{showLocation(show)}</span>
                              <UrgencyBadge days={days} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{full}</p>
                          </div>

                          {/* Ticket CTA */}
                          <a
                            href={show.ticketUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              size="sm"
                              className="bg-green-500/15 text-green-400 hover:bg-green-500/25 border border-green-500/20 rounded-lg h-8 px-3 text-xs font-semibold"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Tickets
                            </Button>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}

            {/* Load more */}
            {hasMore && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={0.35}
                className="flex flex-col items-center gap-2 pt-2"
              >
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="border-border/50 hover:border-primary/40 hover:text-primary px-8 h-10 rounded-xl font-semibold"
                >
                  Load more · {remaining} more artist{remaining !== 1 ? "s" : ""}
                </Button>
              </motion.div>
            )}

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0.4}
              className="text-center text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1.5"
            >
              <Music2 className="w-3 h-3" />
              Shows from Ticketmaster, Bandsintown &amp; Songkick
            </motion.p>
          </div>
        )}
      </div>
    </div>
  );
}
