import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ARTISTS } from "@/lib/data/artists";
import { artistToSlug, slugToArtist } from "@/lib/utils/artist-slug";
import { cityToSlug, slugToCity } from "@/lib/utils/city-slug";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const revalidate = 3600;
export const dynamicParams = true;

const MAJOR_CITIES = [
  "London", "New York", "Los Angeles", "Manchester", "Toronto",
  "Sydney", "Melbourne", "Chicago", "Austin", "Nashville",
  "Atlanta", "Seattle", "Boston", "San Francisco", "Miami",
  "Dallas", "Denver", "Berlin", "Amsterdam", "Paris",
];

const VENUE_THRESHOLDS = [
  { label: "Bar / Club", votes: 500 },
  { label: "Theatre", votes: 2500 },
  { label: "Concert Hall", votes: 7500 },
  { label: "Arena", votes: 25000 },
];

function getNextThreshold(votes: number) {
  return VENUE_THRESHOLDS.find((t) => t.votes > votes) ?? null;
}

function getVenueThreshold(votes: number) {
  for (let i = VENUE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (votes >= VENUE_THRESHOLDS[i].votes) return VENUE_THRESHOLDS[i];
  }
  return null;
}

async function getDeezerImage(name: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.deezer.com/search/artist?q=${encodeURIComponent(name)}&limit=1`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const artist = data.data?.[0];
    return artist?.picture_xl ?? artist?.picture_medium ?? null;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  const top50 = ARTISTS.slice(0, 50);
  return top50.flatMap((artist) =>
    MAJOR_CITIES.map((city) => ({
      artistSlug: artistToSlug(artist.name),
      citySlug: cityToSlug(city),
    }))
  );
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata(
  { params }: { params: Promise<{ artistSlug: string; citySlug: string }> }
): Promise<Metadata> {
  const { artistSlug, citySlug } = await params;
  const artist = slugToArtist(artistSlug);
  const city = slugToCity(citySlug);
  if (!artist || !city) return {};

  const supabase = await createClient();
  const { data } = await supabase
    .from("vote_counts")
    .select("vote_count")
    .eq("artist_id", artist.id)
    .eq("city", city)
    .single();

  const votes = Number(data?.vote_count ?? 0);
  const image = await getDeezerImage(artist.name);
  const title = `${artist.name} Live in ${city} | Summon`;
  const description = `${votes} fans are voting for ${artist.name} to play ${city}. Add your vote and make it happen.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(image ? { images: [{ url: image, width: 500, height: 500, alt: artist.name }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function LivePage(
  { params, searchParams }: {
    params: Promise<{ artistSlug: string; citySlug: string }>;
    searchParams: Promise<{ ref?: string }>;
  }
) {
  const { artistSlug, citySlug } = await params;
  const { ref } = await searchParams;
  const refParam = ref && UUID_RE.test(ref) ? `?ref=${ref}` : "";
  const artist = slugToArtist(artistSlug);
  const city = slugToCity(citySlug);
  if (!artist || !city) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("vote_counts")
    .select("vote_count")
    .eq("artist_id", artist.id)
    .eq("city", city)
    .single();

  const votes = Number(data?.vote_count ?? 0);
  const image = await getDeezerImage(artist.name);

  const nextThreshold = getNextThreshold(votes);
  const currentThreshold = getVenueThreshold(votes);
  const prevVotes = currentThreshold?.votes ?? 0;
  const progressPct = nextThreshold
    ? Math.min(((votes - prevVotes) / (nextThreshold.votes - prevVotes)) * 100, 100)
    : votes > 0 ? 100 : 0;

  const initials = artist.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative pt-24 pb-20 px-6 max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-muted-foreground text-sm">
          <Link href="/explore" className="hover:text-foreground transition-colors">Explore</Link>
          <span>/</span>
          <Link href={`/cities/${citySlug}`} className="hover:text-foreground transition-colors">{city}</Link>
          <span>/</span>
          <span className="text-foreground">{artist.name}</span>
        </div>

        {/* Overline */}
        <p className="text-xs font-semibold tracking-[0.15em] text-primary/70 uppercase mb-2">
          Live Demand · {city}
        </p>

        {/* H1 */}
        <h1 className="text-3xl font-bold tracking-tight mb-8">
          {artist.name} Live in {city}
        </h1>

        {/* Main card */}
        <div className="card-solid rounded-2xl p-6 mb-6">
          {/* Artist info row */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative">
              {image ? (
                <Image
                  src={image}
                  alt={artist.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full gradient-brand flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{initials}</span>
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-lg">{artist.name}</p>
              <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {artist.genre}{artist.subgenre ? ` · ${artist.subgenre}` : ""}
              </span>
            </div>
          </div>

          {/* Vote count */}
          {votes === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm mb-1">No votes yet in {city}</p>
              <p className="text-2xl font-bold gradient-brand-text">
                Be the first!
              </p>
            </div>
          ) : (
            <div>
              <div className="text-center mb-4">
                <p className="text-5xl font-bold gradient-brand-text tabular-nums">
                  {votes.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-1">votes in {city}</p>
              </div>

              {/* Progress bar */}
              {nextThreshold && (
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>{currentThreshold?.label ?? "Starting out"}</span>
                    <span>{nextThreshold.label} — {nextThreshold.votes.toLocaleString()} votes</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full gradient-brand transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 text-right">
                    {(nextThreshold.votes - votes).toLocaleString()} more to unlock {nextThreshold.label}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CTA row */}
        <div className="flex flex-col gap-3">
          <Link
            href={`/artist/${artist.id}${refParam}`}
            className="w-full text-center py-3.5 rounded-xl gradient-brand text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Vote for {city} →
          </Link>
          <div className="flex gap-3">
            <Link
              href={`/cities/${citySlug}`}
              className="flex-1 text-center py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
            >
              All artists in {city}
            </Link>
            <Link
              href={`/artist/${artist.id}${refParam}`}
              className="flex-1 text-center py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
            >
              {artist.name} all cities
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
