import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const faqs = [
  {
    q: "What is Summon?",
    a: "Summon is a fan demand platform for live music. Fans vote for artists they want to see perform in their city. When votes hit milestones, we reach out to venues and booking agents to make the show happen.",
  },
  {
    q: "How does voting work?",
    a: "Pick your city, find an artist you want to see, and hit Vote. One vote per artist per city. Your vote goes directly towards the demand threshold — the more votes, the bigger the venue we can pitch.",
  },
  {
    q: "What are the vote thresholds?",
    a: "Demand is measured in tiers based on total votes in a city: 500 votes → Bar / Club, 2,500 → Theatre, 7,500 → Concert Hall, 25,000 → Arena. When a combo hits a threshold, we contact the artist's team and relevant promoters.",
  },
  {
    q: "What happens when a threshold is reached?",
    a: "We send the demand data directly to the artist's booking agent and local promoters. We can't guarantee a show, but real demand data is the strongest pitch a promoter can make.",
  },
  {
    q: "What does 'Confirmed' mean on an artist?",
    a: "'Confirmed' means the artist already has a ticketed show in that city from a major ticketing platform. You can click through to grab tickets.",
  },
  {
    q: "Can I vote for an artist not in the list?",
    a: "Yes — search for any artist by name. If they're not in our catalogue we'll pull them in from Deezer and you can vote for them instantly.",
  },
  {
    q: "What is Superfan?",
    a: "Superfan is Summon's premium tier ($4/mo). Superfans get a badge on leaderboards, early show alerts when a threshold is crossed, and can track demand across multiple cities. You can upgrade from your profile page.",
  },
  {
    q: "How do I share a vote?",
    a: "After voting you'll see a share button. Sharing is the fastest way to push an artist over a threshold — the more people who vote, the better the chance of a show.",
  },
  {
    q: "Who built Summon?",
    a: "Summon was built by James. If you have questions or feedback, email hello@wesummon.com.",
  },
];

export const metadata = {
  title: "Help & FAQ | Summon",
  description: "How Summon works — voting, thresholds, confirmed shows, and more.",
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-20"
        style={{ background: "radial-gradient(ellipse at top, oklch(0.58 0.22 264 / 40%) 0%, transparent 70%)" }} />

      <div className="pt-24 pb-20 px-6 max-w-2xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary/70 mb-2">Support</p>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Help & FAQ</h1>
        <p className="text-muted-foreground mb-10">Everything you need to know about Summon.</p>

        <div className="flex flex-col gap-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="glass rounded-2xl p-5">
              <h2 className="font-semibold text-sm mb-1.5">{faq.q}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 glass rounded-2xl p-5 text-center">
          <p className="text-sm text-muted-foreground mb-3">Still have questions?</p>
          <a
            href="mailto:hello@wesummon.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold border-0"
          >
            Email us
          </a>
        </div>

        <div className="mt-8 flex items-center gap-4 justify-center text-xs text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/explore" className="hover:text-foreground transition-colors">Explore artists</Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
