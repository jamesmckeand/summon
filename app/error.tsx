"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary/70 mb-3">Something went wrong</p>
        <h1 className="text-2xl font-bold tracking-tight mb-3">Unexpected error</h1>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          An error occurred loading this page. Try again or head back to explore.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="gradient-brand border-0 text-white rounded-xl glow-primary-sm"
          >
            Try again
          </Button>
          <Button variant="outline" className="rounded-xl border-white/10 bg-white/[0.03]" asChild>
            <a href="/explore">Back to Explore</a>
          </Button>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-muted-foreground/40">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
