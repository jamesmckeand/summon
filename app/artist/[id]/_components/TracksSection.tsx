"use client";

import { useRef, useState } from "react";
import { Play, Pause, ExternalLink } from "lucide-react";
import Image from "next/image";

type Track = { title: string; preview: string | null; link: string; albumCover: string | null; duration: number | null };

export default function TracksSection({ tracks }: { tracks: Track[] }) {
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function toggleTrack(preview: string | null) {
    if (!preview) return;
    if (playingTrack === preview) {
      audioRef.current?.pause();
      setPlayingTrack(null);
      return;
    }
    audioRef.current?.pause();
    const audio = new Audio(preview);
    audioRef.current = audio;
    audio.play().catch(() => {});
    audio.onended = () => setPlayingTrack(null);
    setPlayingTrack(preview);
  }

  return (
    <div className="flex flex-col gap-1">
      {tracks.map((track, i) => {
        const isPlaying = playingTrack === track.preview;
        const mins = track.duration ? Math.floor(track.duration / 60) : null;
        const secs = track.duration ? String(track.duration % 60).padStart(2, "0") : null;
        return (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/10 transition-colors group">
            <button
              onClick={() => toggleTrack(track.preview)}
              disabled={!track.preview}
              className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 disabled:opacity-50"
              aria-label={isPlaying ? "Pause" : "Play preview"}
            >
              {track.albumCover ? (
                <Image src={track.albumCover} alt={track.title} fill className="object-cover" sizes="40px" />
              ) : (
                <div className="w-full h-full gradient-brand" />
              )}
              <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${track.preview ? "bg-black/40 opacity-0 group-hover:opacity-100" : ""} ${isPlaying ? "opacity-100 bg-black/50" : ""}`}>
                {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
              </div>
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{track.title}</p>
              {mins !== null && <p className="text-xs text-muted-foreground">{mins}:{secs}</p>}
            </div>

            <a
              href={track.link}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-primary/10"
              aria-label="Open on Deezer"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            </a>
          </div>
        );
      })}
    </div>
  );
}
