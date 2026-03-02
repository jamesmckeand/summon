import { Metadata } from "next";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Terms of Service — Summon",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pt-32 pb-20 px-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-10">Last updated: March 1, 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-muted-foreground leading-relaxed">

          <section>
            <h2 className="text-foreground font-semibold text-lg mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using Summon ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-lg mb-2">2. Description of Service</h2>
            <p>Summon is a fan-driven concert demand platform that allows users to vote for artists they want to see perform live in their city. Votes are aggregated and used to communicate fan demand to venues and promoters. Summon does not guarantee that any show will occur as a result of votes cast on the platform.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-lg mb-2">3. User Accounts</h2>
            <p>You may create an account using a valid email address or through supported third-party authentication providers (Spotify, Apple). You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must provide accurate information and keep it up to date.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-lg mb-2">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Use automated means to cast votes or manipulate vote counts</li>
              <li>Create multiple accounts to inflate demand</li>
              <li>Submit false, misleading, or harmful artist or venue suggestions</li>
              <li>Attempt to reverse engineer, hack, or disrupt the Service</li>
              <li>Use the Service for any unlawful purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-lg mb-2">5. Voting</h2>
            <p>Each registered user may cast one vote per artist per city. Votes are non-transferable and have no monetary value. Summon reserves the right to remove votes that appear fraudulent or in violation of these terms.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-lg mb-2">6. Artist & Venue Submissions</h2>
            <p>Users may submit artists or venues for inclusion on the platform. All submissions are subject to review and approval at Summon's sole discretion. Summon may reject or remove any submission without notice.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-lg mb-2">7. No Guarantees</h2>
            <p>Summon acts as an intermediary to communicate fan demand. We do not guarantee that reaching a vote threshold will result in a show being booked, confirmed, or performed. All show bookings are ultimately subject to artist availability, venue availability, and promoter agreements.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-lg mb-2">8. Intellectual Property</h2>
            <p>All content on Summon, including but not limited to logos, design, and software, is owned by Summon or its licensors. Artist names, images, and related content are the property of their respective owners and are used for informational purposes.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-lg mb-2">9. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, Summon shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Service.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-lg mb-2">10. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance of the new terms. We will notify users of material changes via email or a notice on the platform.</p>
          </section>

          <section>
            <h2 className="text-foreground font-semibold text-lg mb-2">11. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:hello@wesummon.com" className="text-primary hover:underline">hello@wesummon.com</a>.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
