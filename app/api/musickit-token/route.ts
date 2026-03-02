import { NextResponse } from "next/server";
import { SignJWT, importPKCS8 } from "jose";
import { createClient } from "@/lib/supabase/server";

// Cache token in memory — valid for 6 months, we refresh after 5.5
let cache: { token: string; exp: number } | null = null;

export async function GET() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (cache && Date.now() < cache.exp) {
    return NextResponse.json({ token: cache.token });
  }

  const teamId = process.env.APPLE_TEAM_ID!;
  const keyId = process.env.APPLE_MUSIC_KEY_ID!;
  const rawKey = process.env.APPLE_MUSIC_PRIVATE_KEY!;

  // Env vars store literal \n — convert to real newlines
  const pem = rawKey.replace(/\\n/g, "\n");
  const privateKey = await importPKCS8(pem, "ES256");

  const sixMonths = 60 * 60 * 24 * 180;
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: keyId })
    .setIssuer(teamId)
    .setIssuedAt()
    .setExpirationTime(`${sixMonths}s`)
    .sign(privateKey);

  // Refresh 2 weeks before expiry
  cache = { token, exp: Date.now() + (sixMonths - 14 * 24 * 60 * 60) * 1000 };
  return NextResponse.json({ token });
}
