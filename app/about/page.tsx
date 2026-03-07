import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "About | Summon",
  description: "Summon turns fan demand into real live shows. Vote for the artists you want to see in your city.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full opacity-20"
        style={{ background: "radial-gradient(ellipse at top, oklch(0.58 0.22 264 / 40%) 0%, transparent 70%)" }} />

      <div className="pt-32 pb-20 px-6 max-w-2xl mx-auto anim-fade-up">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary/70 mb-2">The company</p>
        <h1 className="text-4xl font-extrabold tracking-tight mb-6">About Summon</h1>

        <div className="space-y-5 text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">Summon</strong> is a live music demand platform. We help fans vote
            for the artists they want to see in their city — and when enough demand accumulates, we contact venues
            and promoters on their behalf to make the show happen.
          </p>
          <p>
            The idea is simple: artists and promoters don&apos;t always know where genuine fan demand exists.
            Summon makes that demand visible, loud, and actionable.
          </p>
          <p>
            When votes for an artist in a city cross a venue threshold — 500 votes for a bar/club,
            2,500 for a theatre, 7,500 for a concert hall, 25,000 for an arena — we reach out directly to
            suitable venues in that city with the data in hand.
          </p>
          <p>
            We&apos;re a small team obsessed with live music. We built Summon because we kept asking the same
            question: &ldquo;Why won&apos;t this artist ever play here?&rdquo;
          </p>

          <div className="pt-4 flex gap-4">
            <Link href="/explore" className="text-primary hover:underline underline-offset-4 font-medium">
              Explore artists →
            </Link>
            <a href="mailto:hello@wesummon.com" className="text-primary hover:underline underline-offset-4 font-medium">
              Get in touch
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
