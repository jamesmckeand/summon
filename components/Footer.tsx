import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/30 mt-16 py-8 px-6">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-sm font-bold gradient-brand-text">Summon</span>
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <a href="mailto:hello@wesummon.com" className="hover:text-foreground transition-colors">Contact</a>
          <span>© {new Date().getFullYear()} Summon</span>
        </div>
      </div>
    </footer>
  );
}
