"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  url: string;
  text: string;
  label?: string;
  size?: "default" | "sm";
  variant?: "default" | "ghost" | "outline";
  className?: string;
  iconOnly?: boolean;
}

export default function ShareButton({
  url,
  text,
  label = "Share",
  size = "default",
  variant = "default",
  className,
  iconOnly = false,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const fullText = `${text}\n${url}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Summon", text, url });
        return;
      } catch {
        // cancelled or unsupported — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard not available (very rare)
    }
  }

  const icon = copied
    ? <Check className={cn("shrink-0", iconOnly ? "w-4 h-4" : "w-4 h-4 mr-2")} />
    : iconOnly
      ? <Share2 className="w-4 h-4 shrink-0" />
      : <Share2 className="w-4 h-4 mr-2 shrink-0" />;

  return (
    <Button
      size={size}
      variant={variant}
      onClick={share}
      className={className}
      title={iconOnly ? label : undefined}
      aria-label={iconOnly ? label : undefined}
    >
      {icon}
      {!iconOnly && (copied ? "Link copied!" : label)}
    </Button>
  );
}
