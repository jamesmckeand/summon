import { ImageResponse } from "next/og";
import { ARTISTS } from "@/lib/data/artists";

export const runtime = "edge";
export const alt = "Summon — Vote for artists to play your city";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artist = ARTISTS.find((a) => a.id === id);

  if (!artist) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0a0a",
          }}
        >
          <span style={{ color: "#fff", fontSize: 48, fontWeight: 700 }}>Summon</span>
        </div>
      ),
      { ...size }
    );
  }

  const photo = await getDeezerImage(artist.name);

  const initials = artist.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#0a0a0a",
          fontFamily: "sans-serif",
        }}
      >
        {/* Artist photo as blurred background */}
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.25,
            }}
          />
        )}

        {/* Dark gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(10,10,10,0.95) 40%, rgba(10,10,10,0.7) 100%)",
          }}
        />

        {/* Left: artist photo square */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "60px",
            gap: "60px",
            position: "relative",
            zIndex: 1,
            width: "100%",
          }}
        >
          {/* Photo or initials */}
          <div
            style={{
              width: 280,
              height: 280,
              borderRadius: 24,
              overflow: "hidden",
              flexShrink: 0,
              background: "linear-gradient(135deg, #7c3aed, #ec4899)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt={artist.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ color: "#fff", fontSize: 80, fontWeight: 700 }}>{initials}</span>
            )}
          </div>

          {/* Text content */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 0 }}>
            {/* Genre badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  padding: "4px 12px",
                  borderRadius: 999,
                  background: "rgba(124, 58, 237, 0.25)",
                  border: "1px solid rgba(124, 58, 237, 0.4)",
                  color: "#a78bfa",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {artist.genre}
              </div>
              {artist.subgenre && (
                <div
                  style={{
                    padding: "4px 12px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#888",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  {artist.subgenre}
                </div>
              )}
            </div>

            {/* Artist name */}
            <div
              style={{
                fontSize: artist.name.length > 16 ? 56 : 72,
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                marginBottom: 20,
              }}
            >
              {artist.name}
            </div>

            {/* CTA */}
            <div style={{ color: "#888", fontSize: 20, marginBottom: 28 }}>
              Vote to bring them to your city
            </div>

            {/* Summon branding */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#fff",
                }}
              >
                S
              </div>
              <span style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>Summon</span>
              <span style={{ color: "#555", fontSize: 18, marginLeft: 4 }}>wesummon.com</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
