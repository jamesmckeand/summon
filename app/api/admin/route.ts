import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
const resend = new Resend(process.env.RESEND_API_KEY);

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  if (!ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) return null;
  return { supabase, user };
}

function buildEmail(
  status: "approved" | "rejected",
  submission: {
    type: string;
    artist_name?: string;
    venue_name?: string;
    venue_city?: string;
    review_note?: string | null;
  }
): { subject: string; html: string } {
  const name = submission.type === "artist"
    ? submission.artist_name
    : `${submission.venue_name} (${submission.venue_city})`;

  const typeLabel = submission.type === "artist" ? "artist" : "venue";

  if (status === "approved") {
    return {
      subject: `Your ${typeLabel} submission has been approved ✓`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0a0a0a;color:#f0f0f0;border-radius:12px">
          <h2 style="margin:0 0 8px;font-size:22px;color:#fff">Good news! 🎉</h2>
          <p style="color:#aaa;margin:0 0 24px;font-size:15px">Your submission has been reviewed.</p>
          <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:24px">
            <p style="margin:0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:.05em">Submission</p>
            <p style="margin:6px 0 0;font-size:18px;font-weight:700;color:#fff">${name}</p>
          </div>
          <p style="color:#d4d4d4;font-size:15px;line-height:1.6">
            Your ${typeLabel} submission has been <strong style="color:#4ade80">approved</strong> and is now live on Summon.
          </p>
          ${submission.review_note ? `<p style="color:#aaa;font-size:14px;font-style:italic;border-left:3px solid #333;padding-left:12px;margin-top:16px">${submission.review_note}</p>` : ""}
          <a href="https://wesummon.com/explore" style="display:inline-block;margin-top:24px;padding:12px 24px;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">
            View on Summon →
          </a>
          <p style="color:#555;font-size:12px;margin-top:32px">Summon · Fan-driven shows</p>
        </div>
      `,
    };
  }

  return {
    subject: `Update on your ${typeLabel} submission`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0a0a0a;color:#f0f0f0;border-radius:12px">
        <h2 style="margin:0 0 8px;font-size:22px;color:#fff">Submission update</h2>
        <p style="color:#aaa;margin:0 0 24px;font-size:15px">Your submission has been reviewed.</p>
        <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:24px">
          <p style="margin:0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:.05em">Submission</p>
          <p style="margin:6px 0 0;font-size:18px;font-weight:700;color:#fff">${name}</p>
        </div>
        <p style="color:#d4d4d4;font-size:15px;line-height:1.6">
          Unfortunately your ${typeLabel} submission wasn't approved at this time.
        </p>
        ${submission.review_note ? `<p style="color:#aaa;font-size:14px;font-style:italic;border-left:3px solid #333;padding-left:12px;margin-top:16px">${submission.review_note}</p>` : ""}
        <p style="color:#888;font-size:14px;margin-top:16px">
          You're welcome to submit again if you think this was a mistake or have updated information.
        </p>
        <a href="https://wesummon.com/submit" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#1a1a1a;border:1px solid #333;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px">
          Submit again →
        </a>
        <p style="color:#555;font-size:12px;margin-top:32px">Summon · Fan-driven shows</p>
      </div>
    `,
  };
}

export async function GET() {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data } = await ctx.supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });

  return NextResponse.json({ submissions: data ?? [] });
}

export async function PATCH(request: Request) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, status, review_note } = await request.json();
  if (!id || !["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Fetch submission before updating (to get submitter_email + details)
  const { data: submission } = await ctx.supabase
    .from("submissions")
    .select("type, artist_name, artist_genre, artist_subgenre, artist_instagram, artist_spotify, deezer_image, venue_name, venue_city, submitter_email")
    .eq("id", id)
    .single();

  const { error } = await ctx.supabase
    .from("submissions")
    .update({ status, review_note: review_note ?? null, reviewed_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If approving an artist — add them to live_artists so they appear in the app
  if (status === "approved" && submission?.type === "artist" && submission.artist_name) {
    await ctx.supabase.from("live_artists").upsert({
      id: `da_${id}`,
      name: submission.artist_name,
      genre: submission.artist_genre ?? "Other",
      subgenre: submission.artist_subgenre ?? null,
      deezer_image: submission.deezer_image ?? null,
      instagram: submission.artist_instagram ?? null,
      spotify: submission.artist_spotify ?? null,
      source_id: id,
    });
  }

  // Send email if we have a submitter address
  if (submission?.submitter_email) {
    const { subject, html } = buildEmail(status, { ...submission, review_note });
    await resend.emails.send({
      from: "Summon <hello@wesummon.com>",
      to: submission.submitter_email,
      subject,
      html,
    });
  }

  return NextResponse.json({ ok: true });
}
