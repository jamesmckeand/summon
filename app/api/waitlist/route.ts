import { NextResponse } from "next/server";
import { Resend } from "resend";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

// In-memory IP throttle — 3 submissions per IP per hour.
// Resets on cold start but good enough to stop scripted abuse.
const ipThrottle = new Map<string, { count: number; resetAt: number }>();
const IP_MAX = 3;
const IP_WINDOW_MS = 60 * 60 * 1000;

function allowIp(ip: string): boolean {
  const now = Date.now();
  const entry = ipThrottle.get(ip);
  if (!entry || now > entry.resetAt) {
    ipThrottle.set(ip, { count: 1, resetAt: now + IP_WINDOW_MS });
    return true;
  }
  if (entry.count >= IP_MAX) return false;
  entry.count++;
  return true;
}

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // IP rate limit
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!allowIp(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Deduplicate — insert email into waitlist table.
  // Unique constraint (23505) means it's already registered; silently succeed
  // so we don't burn Resend quota or spam the user again.
  const supabase = await createClient();
  const { error: dbError } = await supabase.from("waitlist").insert({ email });
  if (dbError?.code === "23505") {
    return NextResponse.json({ ok: true });
  }

  // Notify admin
  await resend.emails.send({
    from: "Summon <hello@wesummon.com>",
    to: process.env.ADMIN_EMAILS ?? "hello@wesummon.com",
    subject: `New waitlist signup: ${email}`,
    html: `<p><strong>${email}</strong> joined the Summon waitlist.</p>`,
  }).catch(() => {});

  // Confirm to user
  await resend.emails.send({
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
