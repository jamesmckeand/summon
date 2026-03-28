import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  if (!ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) return null;
  return user;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();

  const [{ data: contacts }, { data: promoterSends }] = await Promise.all([
    admin
      .from("artist_contact_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
    admin
      .from("outreach_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  return NextResponse.json({
    contacts: contacts ?? [],
    promoterSends: promoterSends ?? [],
  });
}

export async function PATCH(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { table, id, updates } = await request.json();
  if (!["artist_contact_log", "outreach_log"].includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from(table).update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
