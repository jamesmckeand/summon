import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MapPin, TrendingUp } from "lucide-react";
import { CITIES } from "@/lib/data/cities";
import { ARTISTS } from "@/lib/data/artists";
import { cityToSlug, slugToCity } from "@/lib/utils/city-slug";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import artistImages from "@/lib/data/artist-images.json";

export const revalidate = 60;

export async function generateStaticParams() {
  return CITIES.map((city) => ({ citySlug: cityToSlug(city) }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ citySlug: string }> }
): Promise<Metadata> {
  const { citySlug } = await params;
  const city = slugToCity(citySlug);
  if (!city) return {};
  return {
    title: `Artists to See Live in ${city} | Summon`,
    description: `See which artists fans are voting to see live in ${city}. Cast your vote and make it happen.`,
  };
}

const TIERS = [500, 2500, 7500, 25000];
function progressPct(votes: number) {
  const next = TIERS.find((t) => t > votes);
  if (!next) return 100;
  const prev = TIERS[TIERS.indexOf(next) - 1] ?? 0;
  return Math.min(((votes - prev) / (next - prev)) * 100, 100);
}
function nextVenueLabel(votes: number) {
  const labels = [
    { votes: 25000, label: "Arena" },
    { votes: 7500, label: "Concert Hall" },
    { votes: 2500, label: "Theatre" },
    { votes: 500, label: "Bar / Club" },
  ];
  for (const t of labels) { if (votes >= t.votes) return t.label; }
  const next = TIERS.find((t) => t > votes);
  if (!next) return "";
  const nextLabel = labels.slice().reverse().find((l) => l.votes === next);
  return nextLabel ? `${(next - votes).toLocaleString()} to ${nextLabel.label}` : "";
}

type ArtistRow = {
  id: string;
  name: string;
  genre: string;
  votes: number;
  image: string | null;
};

export default async function CityPage(
  { params }: { params: Promise<{ citySlug: string }> }
) {
  const { citySlug } = await params;
  const city = slugToCity(citySlug);
  if (!city) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("vote_counts")
    .select("artist_id, vote_count")
    .eq("city", city)
    .order("vote_count", { ascending: false })
    .limit(20);

  const images = artistImages as Record<string, string | null>;

  const artists: ArtistRow[] = (data ?? [])
    .map((row) => {
      const artist = ARTISTS.find((a) => a.id === row.artist_id);
      if (!artist) return null;
      return {
        id: artist.id,
        name: artist.name,
        genre: artist.genre,
        votes: Number(row.vote_count),
        image: images[artist.name] ?? null,
      };
    })
    .filter((a): a is ArtistRow => a !== null);

  const totalVotes = artists.reduce((s, a) => s + a.votes, 0);

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-20"
        style={{ background: "radial-gradient(ellipse at top, oklch(0.58 0.22 264 / 40%) 0%, transparent 70%)" }} />
      <div className="pt-24 pb-20 px-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 text-muted-foreground text-sm">
            <Link href="/cities" className="hover:text-foreground transition-colors">Cities</Link>
            <span>/</span>
            <span className="text-foreground">{city}</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary/70 mb-2">{city}</p>
          <h1 className="text-3xl font-bold tracking-tight">Artists to See Live in {city}</h1>
          <p className="mt-1 text-muted-foreground">
            Top artists fans are voting for in {city}. Add your voice.
          </p>
          {totalVotes > 0 && (
            <p className="mt-3 text-sm">
              <span className="font-extrabold gradient-brand-text tabular-nums">{totalVotes.toLocaleString()}</span>
              <span className="text-muted-foreground ml-1.5">total votes in {city}</span>
            </p>
          )}
        </div>

        {artists.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="mb-4">No votes yet in {city} — be the first!</p>
            <Link
              href={`/explore?city=${encodeURIComponent(city)}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold"
            >
              Vote in {city}
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 mb-8">
              {artists.map((artist, i) => {
                const initials = artist.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
                return (
                  <Link key={artist.id} href={`/artist/${artist.id}`}>
                    <div className={`glass rounded-xl overflow-hidden hover:border-primary/20 transition-all group ${
                      i === 0 ? "border-yellow-500/25" : i === 1 ? "border-slate-400/20" : i === 2 ? "border-amber-600/20" : ""
                    }`}>
                      <div className="p-4 flex items-center gap-4">
                        <span className="text-sm font-mono w-6 text-center shrink-0"
                          style={{ color: i === 0 ? "#facc15" : i === 1 ? "#cbd5e1" : i === 2 ? "#d97706" : undefined }}>
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <span className="text-muted-foreground">{i + 1}</span>}
                        </span>
                        <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 relative">
                          {artist.image ? (
                            <Image
                              src={artist.image}
                              alt={artist.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="44px"
                            />
                          ) : (
                            <div className="w-full h-full gradient-brand flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{initials}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm group-hover:text-primary transition-colors">{artist.name}</p>
                          <p className="text-xs text-muted-foreground">{artist.genre}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5 text-primary" />
                            <span className="text-sm font-bold text-primary">{artist.votes.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground">votes</span>
                          </div>
                          <p className="text-xs text-muted-foreground/60 mt-0.5">{nextVenueLabel(artist.votes)}</p>
                        </div>
                      </div>
                      {artist.votes > 0 && (
                        <div className="h-0.5 bg-muted/60 w-full">
                          <div className="h-full gradient-brand opacity-60" style={{ width: `${progressPct(artist.votes)}%` }} />
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="text-center">
              <Link
                href={`/explore?city=${encodeURIComponent(city)}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Vote in {city} →
              </Link>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
