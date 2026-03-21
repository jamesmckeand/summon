import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/30 mt-16">
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-8">
        <div className="flex flex-col sm:flex-row justify-between gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold gradient-brand-text">Summon</span>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[140px]">
              Fans making shows happen.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs text-muted-foreground">
            <div className="flex flex-col gap-3">
              <p className="font-semibold text-foreground/50 uppercase tracking-[0.1em] text-xs">Discover</p>
              <Link href="/cities" className="hover:text-foreground transition-colors">Cities</Link>
              <Link href="/shows" className="hover:text-foreground transition-colors">Shows</Link>
              <Link href="/explore" className="hover:text-foreground transition-colors">Explore</Link>
              <Link href="/leaderboard" className="hover:text-foreground transition-colors">Leaderboard</Link>
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-semibold text-foreground/50 uppercase tracking-[0.1em] text-xs">Company</p>
              <Link href="/help" className="hover:text-foreground transition-colors">Help</Link>
              <Link href="/submit" className="hover:text-foreground transition-colors">Suggest an artist</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-semibold text-foreground/50 uppercase tracking-[0.1em] text-xs">Contact</p>
              <a href="mailto:hello@wesummon.com" className="hover:text-foreground transition-colors">hello@wesummon.com</a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border/20 px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Summon · <span className="opacity-40">James McKeand</span></p>
        </div>
      </div>
    </footer>
  );
}
