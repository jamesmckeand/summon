import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { token, platform } = await request.json();
  if (!token || !platform) return NextResponse.json({ error: "token and platform required" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from("push_tokens").upsert(
    { token, platform, user_id: user?.id ?? null },
    { onConflict: "token" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
