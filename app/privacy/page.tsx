import { Metadata } from "next";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Privacy Policy — Summon",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pt-32 pb-20 px-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-10">Last updated: March 1, 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-muted-foreground leading-relaxed">

          <section>
            <h2 className="text-foreground font-semibold text-lg mb-2">1. Information We Collect</h2>
            <p>When you use Summon, we collect:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong className="text-foreground">Account information</strong> — your email address, display name, and avatar (provided directly or via Spotify/Apple OAuth)</li>
              <li><strong className="text-foreground">Voting data</strong> — the artists and cities you have voted for</li>
              <li><strong className="text-foreground">Profile preferences</strong> — your home city, favourite artists, and favourite venue types</li>
              <li><strong className="text-foreground">Usage data</strong> — pages visited, interactions with the platform, and general analytics (via Vercel Analytics)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-lg mb-2">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Provide and improve the Summon platform</li>
              <li>Track and display vote counts per artist and city</li>
              <li>Personalise your experience (home city auto-detection, recommendations)</li>
              <li>Send transactional emails (account confirmation, submission status updates)</li>
              <li>Communicate fan demand to venues and promoters on your behalf</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-lg mb-2">3. Information We Share</h2>
            <p>We do not sell your personal information. We may share information with:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong className="text-foreground">Venues and promoters</strong> — aggregated, anonymised vote counts only (no personal data)</li>
              <li><strong className="text-foreground">Service providers</strong> — Supabase (database and auth), Vercel (hosting), Resend (email delivery)</li>
              <li><strong className="text-foreground">Legal authorities</strong> — if required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-lg mb-2">4. Third-Party Authentication</h2>
            <p>If you sign in with Spotify or Apple, we receive your email address, display name, and profile picture from those services. We do not receive your Spotify listening history, playlists, or payment information. Review Spotify's and Apple's privacy policies for details on how they handle your data.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-lg mb-2">5. Cookies & Analytics</h2>
            <p>We use cookies and local storage to maintain your session and remember your city preference. We use Vercel Analytics to understand how users interact with the platform. This data is anonymised and does not include personally identifiable information.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-lg mb-2">6. Data Retention</h2>
            <p>We retain your account data for as long as your account is active. You may request deletion of your account and associated data at any time by emailing <a href="mailto:hello@wesummon.com" className="text-primary hover:underline">hello@wesummon.com</a>.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-lg mb-2">7. Security</h2>
            <p>We take reasonable measures to protect your data, including encrypted connections (HTTPS), secure authentication via Supabase, and access controls. No system is completely secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-lg mb-2">8. Your Rights</h2>
            <p>Depending on your location, you may have the right to access, correct, or delete your personal data. To exercise these rights, contact us at <a href="mailto:hello@wesummon.com" className="text-primary hover:underline">hello@wesummon.com</a>.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-lg mb-2">9. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify users of material changes via email or a notice on the platform.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-lg mb-2">10. Contact</h2>
            <p>For privacy questions or requests, contact us at <a href="mailto:hello@wesummon.com" className="text-primary hover:underline">hello@wesummon.com</a>.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
