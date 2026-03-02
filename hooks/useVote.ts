"use client";
import { useRouter } from "next/navigation";
import { useVoteStore } from "@/lib/store/votes";
import { createClient } from "@/lib/supabase/client";

export function useVote() {
  const { vote, unvote, hasVoted } = useVoteStore();
  const router = useRouter();

  async function handleVote(artistId: string, city: string) {
    const { data: { user } } = await createClient().auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const isVoted = hasVoted(artistId, city);
    // Optimistic update
    isVoted ? unvote(artistId, city) : vote(artistId, city);

    try {
      const res = await fetch("/api/votes", {
        method: isVoted ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId, city }),
      });
      if (!res.ok) throw new Error("vote failed");
    } catch {
      // Revert optimistic update on failure
      isVoted ? vote(artistId, city) : unvote(artistId, city);
    }
  }

  return { handleVote, hasVoted };
}
