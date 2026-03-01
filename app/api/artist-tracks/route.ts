import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  if (!name) return NextResponse.json({ tracks: [] });

  try {
    const searchRes = await fetch(
      `https://api.deezer.com/search/artist?q=${encodeURIComponent(name)}&limit=1`,
      { next: { revalidate: 86400 } }
    );
    if (!searchRes.ok) return NextResponse.json({ tracks: [] });

    const searchData = await searchRes.json();
    const artist = searchData.data?.[0];
    if (!artist?.id) return NextResponse.json({ tracks: [] });

    const topRes = await fetch(
      `https://api.deezer.com/artist/${artist.id}/top?limit=5`,
      { next: { revalidate: 86400 } }
    );
    if (!topRes.ok) return NextResponse.json({ tracks: [] });

    const topData = await topRes.json();
    const tracks = (topData.data ?? []).map((t: { title: string; preview: string; link: string }) => ({
      title: t.title,
      preview: t.preview,
      link: t.link,
    }));

    return NextResponse.json({ tracks }, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  } catch {
    return NextResponse.json({ tracks: [] });
  }
}
