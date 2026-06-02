import { NextResponse } from "next/server";
import { Resend } from "resend";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

function getResend() {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // IP rate limit — 3 submissions per IP per hour
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!await checkRateLimit(`waitlist:${ip}`, 3, 3600)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Deduplicate — insert email into waitlist table.
  // Unique constraint (23505) means it's already registered; silently succeed
  // so we don't burn Resend quota or spam the user again.
  const supabase = await createClient();
  const { error: dbError } = await supabase.from("waitlist").insert({ email });
  if (dbError) {
    if (dbError.code === "23505") return NextResponse.json({ ok: true });
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  // Notify admin
  await getResend().emails.send({
    from: "Summon <hello@wesummon.com>",
    to: process.env.ADMIN_EMAILS ?? "hello@wesummon.com",
    subject: `New waitlist signup: ${email}`,
    html: `<p><strong>${email}</strong> joined the Summon waitlist.</p>`,
  }).catch(() => {});

  // Confirm to user
  await getResend().emails.send({
    from: "Summon <hello@wesummon.com>",
    to: email,
    subject: "You're on the Summon waitlist 🎶",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0a0a0a;color:#f0f0f0;border-radius:12px">
        <h2 style="margin:0 0 8px;font-size:22px;color:#fff">You're on the list.</h2>
        <p style="color:#aaa;margin:0 0 24px;font-size:15px">We'll let you know when Summon launches in your city.</p>
        <p style="color:#d4d4d4;font-size:15px;line-height:1.6">
          Summon lets fans vote for the artists they want to see live. When enough votes build up, we reach out to venues and make the show happen — for real.
        </p>
        <p style="color:#555;font-size:12px;margin-top:32px">Summon · <a href="https://wesummon.com" style="color:#555">wesummon.com</a></p>
      </div>
    `,
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
