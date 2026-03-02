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
          // Build a fresh map from DB (source of truth per city)
          const fromDb: Record<string, string[]> = {};
          for (const { artist_id, city } of dbVotes) {
            if (!fromDb[city]) fromDb[city] = [];
            if (!fromDb[city].includes(artist_id)) fromDb[city].push(artist_id);
          }
          // DB wins for any city it mentions; keep local for cities not yet in DB (offline/pending)
          return { votes: { ...state.votes, ...fromDb } };
        }),

      clearVotes: () => set({ votes: {} }),
    }),
    { name: "summon-votes" }
  )
);
