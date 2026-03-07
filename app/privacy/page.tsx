import type { Metadata } from "next";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Privacy Policy | Summon",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pt-32 pb-20 px-6 max-w-2xl mx-auto anim-fade-up">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary/70 mb-2">Legal</p>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: March 2026</p>

        <div className="space-y-8 text-muted-foreground leading-relaxed text-sm">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Information we collect</h2>
            <p>We collect your email address, name (from social sign-in), and vote activity. We also collect the city you select for voting purposes.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">How we use it</h2>
            <p>We use your information to operate the Service, send transactional emails (magic links, notifications), and aggregate vote counts. We do not sell your personal data.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Third-party services</h2>
            <p>We use Supabase for authentication and data storage, Vercel for hosting, and Resend for email delivery. Each operates under their own privacy policies.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Spotify &amp; Apple Music</h2>
            <p>If you connect Spotify or Apple Music, we access your top artists to personalise the explore page. We do not store this data beyond your session.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Your rights</h2>
            <p>You can delete your account and all associated data at any time by emailing <a href="mailto:hello@wesummon.com" className="text-primary hover:underline">hello@wesummon.com</a>.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Cookies</h2>
            <p>We use cookies only for authentication purposes. We do not use tracking or advertising cookies.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Contact</h2>
            <p>Privacy questions: <a href="mailto:hello@wesummon.com" className="text-primary hover:underline">hello@wesummon.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
