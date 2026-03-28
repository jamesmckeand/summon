import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-8xl font-extrabold gradient-brand-text tabular-nums">404</p>
      <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
        This page doesn&apos;t exist or may have been moved.
      </p>
      <Link href="/">
        <Button className="gradient-brand border-0 text-white font-semibold rounded-xl px-7">
          Go home
        </Button>
      </Link>
    </div>
  );
}
