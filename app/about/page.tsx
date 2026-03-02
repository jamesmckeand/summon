import { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { ArrowRight, Music2, MapPin, TrendingUp, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "About — Summon",
  description: "Summon is a fan-driven platform that turns concert demand into real shows.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pt-32 pb-20 px-6 max-w-2xl mx-auto">

        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">About</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-6">
          We make shows happen.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-12">
          Summon is a fan-driven concert demand platform. Fans vote for the artists they want to see live in their city — and when demand reaches a venue threshold, we reach out to make the show happen for real.
        </p>

        <div className="space-y-5 mb-16">
          {[
            {
              icon: Music2,
              title: "Vote for your favourite artists",
              body: "Browse our catalogue of 1,000+ artists across every genre. Find who you want to see live and cast your vote. Every vote is counted and publicly visible.",
            },
            {
              icon: MapPin,
              title: "Votes are tied to your city",
              body: "Votes are city-specific. Whether you're in Toronto, Austin, or Auckland, your votes go toward demand in your local market.",
            },
            {
              icon: TrendingUp,
              title: "Demand builds over time",
              body: "Votes accumulate and are tracked against venue thresholds — from intimate bar shows at 500 votes to full arenas at 25,000.",
            },
            {
              icon: Zap,
              title: "We match demand to venues",
              body: "When a threshold is hit, Summon contacts local venues and promoters directly on behalf of fans. Real outreach, not just a petition.",
            },
          ].map((item) => (
            <div key={item.title} className="glass rounded-2xl p-6 flex gap-5 items-start">
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold mb-1">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to summon a show?</h2>
          <p className="text-muted-foreground mb-6">Join fans already voting for their favourite artists.</p>
          <Link href="/explore">
            <Button className="gradient-brand border-0 text-white font-semibold px-6 h-11 rounded-xl glow-primary-sm">
              Browse artists
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
