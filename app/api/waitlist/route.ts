import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Notify admin
  await resend.emails.send({
    from: "Summon <hello@wesummon.com>",
    to: "jamesmckeand@gmail.com",
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
