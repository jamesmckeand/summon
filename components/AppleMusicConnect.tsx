"use client";

import { useState } from "react";
import { ARTISTS } from "@/lib/data/artists";

declare global {
  interface Window {
    MusicKit: {
      configure(config: object): void;
      getInstance(): { authorize(): Promise<string>; isAuthorized: boolean };
    };
  }
}

interface Props {
  onArtists: (artists: typeof ARTISTS) => void;
  className?: string;
}

function loadMusicKitJS(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.MusicKit) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://js-cdn.music.apple.com/musickit/v3/musickit.js";
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function AppleMusicConnect({ onArtists, className }: Props) {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  async function connect() {
    setLoading(true);
    try {
      const tokenRes = await fetch("/api/musickit-token");
      const { token } = await tokenRes.json();

      await loadMusicKitJS();

      window.MusicKit.configure({
        developerToken: token,
        app: { name: "Summon", build: "1.0.0" },
      });

      const musicUserToken = await window.MusicKit.getInstance().authorize();

      const res = await fetch("/api/apple-music-top-artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ musicUserToken }),
      });

      const data = await res.json();
      if (Array.isArray(data.artists)) {
        onArtists(data.artists);
        setConnected(true);
      }
    } catch {
      // silently fail — user may have denied or isn't an Apple Music subscriber
    } finally {
      setLoading(false);
    }
  }

  if (connected) return null;

  return (
    <button
      onClick={connect}
      disabled={loading}
      className={`flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 ${className ?? ""}`}
    >
      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
      </svg>
      {loading ? "Connecting…" : "Import from Apple Music"}
    </button>
  );
}
