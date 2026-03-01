import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  if (!name) return NextResponse.json({ image: null });

  try {
    const res = await fetch(
      `https://api.deezer.com/search/artist?q=${encodeURIComponent(name)}&limit=1`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) return NextResponse.json({ image: null });

    const data = await res.json();
    const artist = data.data?.[0];
    const image = artist?.picture_medium ?? artist?.picture ?? null;

    return NextResponse.json({ image }, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  } catch {
    return NextResponse.json({ image: null });
  }
}
