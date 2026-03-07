import type { Metadata } from "next";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Terms of Service | Summon",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pt-32 pb-20 px-6 max-w-2xl mx-auto anim-fade-up">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary/70 mb-2">Legal</p>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: March 2026</p>

        <div className="space-y-8 text-muted-foreground leading-relaxed text-sm">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">1. Acceptance</h2>
            <p>By using Summon (&ldquo;the Service&rdquo;), you agree to these terms. If you do not agree, please do not use the Service.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">2. What Summon does</h2>
            <p>Summon collects fan votes for artists in specific cities. When a vote threshold is reached, Summon may contact venues and promoters to facilitate shows. We do not guarantee that any show will be produced as a result of votes.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">3. Accounts</h2>
            <p>You must provide accurate information when creating an account. You are responsible for activity under your account. One account per person.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">4. Voting</h2>
            <p>Votes are intended to represent genuine fan demand. Vote manipulation, including use of bots or multiple accounts, is prohibited and may result in account suspension.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">5. Limitation of liability</h2>
            <p>Summon is provided as-is. We are not liable for indirect, incidental, or consequential damages. Our total liability shall not exceed the amount you have paid to us in the past 12 months.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">6. Changes</h2>
            <p>We may update these terms. Continued use of the Service after changes constitutes acceptance.</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">7. Contact</h2>
            <p>Questions? Email us at <a href="mailto:hello@wesummon.com" className="text-primary hover:underline">hello@wesummon.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
