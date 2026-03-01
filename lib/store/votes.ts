import { create } from "zustand";
import { persist } from "zustand/middleware";

type VoteStore = {
  votes: Record<string, string[]>; // city → artistIds[]
  activeCity: string; // dashboard selected city
  vote: (artistId: string, city: string) => void;
  unvote: (artistId: string, city: string) => void;
  hasVoted: (artistId: string, city: string) => boolean;
  setActiveCity: (city: string) => void;
  votedCities: () => string[]; // cities with ≥1 vote
  initFromDb: (dbVotes: { artist_id: string; city: string }[]) => void;
  clearVotes: () => void;
};

export const useVoteStore = create<VoteStore>()(
  persist(
    (set, get) => ({
      votes: {},
      activeCity: "",

      vote: (artistId, city) =>
        set((state) => {
          const cityVotes = state.votes[city] ?? [];
          if (cityVotes.includes(artistId)) return state;
          return { votes: { ...state.votes, [city]: [...cityVotes, artistId] } };
        }),

      unvote: (artistId, city) =>
        set((state) => {
          const cityVotes = state.votes[city] ?? [];
          return {
            votes: { ...state.votes, [city]: cityVotes.filter((id) => id !== artistId) },
          };
        }),

      hasVoted: (artistId, city) => {
        const cityVotes = get().votes[city] ?? [];
        return cityVotes.includes(artistId);
      },

      setActiveCity: (city) => set({ activeCity: city }),

      votedCities: () =>
        Object.entries(get().votes)
          .filter(([, ids]) => ids.length > 0)
          .map(([city]) => city),

      initFromDb: (dbVotes) =>
        set((state) => {
          const merged = { ...state.votes };
          for (const { artist_id, city } of dbVotes) {
            const existing = merged[city] ?? [];
            if (!existing.includes(artist_id)) merged[city] = [...existing, artist_id];
          }
          return { votes: merged };
        }),

      clearVotes: () => set({ votes: {} }),
    }),
    { name: "summon-votes" }
  )
);
