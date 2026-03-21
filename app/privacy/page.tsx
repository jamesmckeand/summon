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
            <p className="mb-2">We use the following third-party services, each operating under their own privacy policies:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Supabase</strong> — authentication and database (supabase.com/privacy)</li>
              <li><strong>Vercel</strong> — hosting and edge functions (vercel.com/legal/privacy-policy)</li>
              <li><strong>Resend</strong> — transactional email delivery (resend.com/legal/privacy-policy)</li>
              <li><strong>Stripe</strong> — payment processing for Superfan subscriptions. Stripe may collect payment card data, billing address, and device identifiers. We do not store card details. (stripe.com/privacy)</li>
              <li><strong>Sentry</strong> — crash reporting and error tracking. Sentry may collect device information, IP address, and stack traces when errors occur. (sentry.io/privacy)</li>
              <li><strong>Deezer</strong> — artist image data fetched from the Deezer public API. No personal data is shared with Deezer. (deezer.com/legal/personal-datas)</li>
              <li><strong>Apple Push Notification Service (APNs)</strong> — used to deliver push notifications to iOS devices. Device tokens are stored to enable notification delivery and deleted when you disable push notifications or delete your account.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Spotify &amp; Apple Music</h2>
            <p>If you connect Spotify or Apple Music, we access your top artists to personalise the explore page. We do not store this data beyond your session.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Push notifications</h2>
            <p>If you enable push notifications, we store a device token provided by Apple (APNs) to send you alerts when vote thresholds are crossed. You can disable push notifications at any time in Settings. Tokens are deleted when you delete your account.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Data collected</h2>
            <p className="mb-2">We collect and process the following categories of data:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Email address (for authentication and notifications)</li>
              <li>Name (from social sign-in providers, optional)</li>
              <li>Username (chosen by you, displayed on leaderboards)</li>
              <li>City preference (for vote filtering)</li>
              <li>Vote activity (artist + city combinations you vote for)</li>
              <li>Device push token (if push notifications are enabled)</li>
              <li>IP address (for rate limiting — not stored persistently)</li>
              <li>Crash and error data (via Sentry, for app stability)</li>
            </ul>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Your rights</h2>
            <p>You can delete your account and all associated data at any time from the Settings page or by emailing <a href="mailto:hello@wesummon.com" className="text-primary hover:underline">hello@wesummon.com</a>. We will action deletion requests within 30 days.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">Cookies</h2>
            <p>We use cookies only for authentication purposes (session management). We do not use tracking, advertising, or analytics cookies.</p>
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
