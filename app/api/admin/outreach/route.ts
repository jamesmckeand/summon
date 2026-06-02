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

  const ALLOWED_COLUMNS: Record<string, Set<string>> = {
    artist_contact_log: new Set(["status", "notes", "manager_name", "manager_email", "booking_agent_name", "booking_agent_email", "agency"]),
    outreach_log:       new Set(["status", "notes"]),
  };

  const safeUpdates: Record<string, unknown> = {};
  for (const [col, val] of Object.entries(updates ?? {})) {
    if (ALLOWED_COLUMNS[table].has(col)) safeUpdates[col] = val;
  }

  const admin = createAdminClient();
  const { error } = await admin.from(table).update({ ...safeUpdates, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
