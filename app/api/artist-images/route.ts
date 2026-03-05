import { NextResponse } from "next/server";
import images from "@/lib/data/artist-images.json";

export const revalidate = false; // static — never revalidate

export async function GET() {
  return NextResponse.json({ images }, {
    headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600" },
  });
}
