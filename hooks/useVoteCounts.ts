"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export function useVoteCounts(city: string) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchCounts = useCallback(() => {
    fetch(`/api/vote-counts?city=${encodeURIComponent(city)}`)
      .then((r) => r.json())
      .then((data) => { if (data.counts) setCounts(data.counts); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [city]);

  useEffect(() => {
    setLoading(true);
    fetchCounts();

    const supabase = createClient();
    const channel = supabase
      .channel(`vote_counts:${city}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "votes" }, fetchCounts)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [city, fetchCounts]);

  return { counts, loading };
}
