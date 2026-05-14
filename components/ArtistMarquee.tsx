"use client";

const ARTISTS = [
  "Taylor Swift",
  "Drake",
  "Kendrick Lamar",
  "Billie Eilish",
  "The Weeknd",
  "Bad Bunny",
  "Sabrina Carpenter",
  "Chappell Roan",
  "Tyler, the Creator",
  "Frank Ocean",
  "SZA",
  "Olivia Rodrigo",
  "Post Malone",
  "Arctic Monkeys",
  "Tame Impala",
  "Charli XCX",
  "Lana Del Rey",
  "Vampire Weekend",
];

export default function ArtistMarquee() {
  // Duplicate list so the seamless loop always has enough tiles
  const tiles = [...ARTISTS, ...ARTISTS];

  return (
    <div
      className="relative w-full overflow-hidden mb-8"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <div
        className="flex gap-2 w-max"
        style={{ animation: "marquee-left 28s linear infinite" }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLDivElement).style.animationPlayState =
            "paused")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLDivElement).style.animationPlayState =
            "running")
        }
      >
        {tiles.map((name, i) => (
          <span
            key={i}
            className="shrink-0 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-sm text-white/70 whitespace-nowrap select-none"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
