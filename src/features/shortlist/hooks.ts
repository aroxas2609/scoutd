"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { PlayerProfile } from "@/types/database";

async function fetchShortlistPlayers(): Promise<PlayerProfile[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: saved } = await supabase
    .from("saved_players")
    .select("player_id")
    .eq("coach_id", user.id);

  if (!saved?.length) return [];

  const ids = saved.map((s) => s.player_id);
  const { data } = await supabase
    .from("player_profiles")
    .select("*, profiles!inner(*)")
    .in("user_id", ids);

  return (data ?? []) as PlayerProfile[];
}

export function useShortlistPlayers() {
  return useQuery({
    queryKey: ["shortlist"],
    queryFn: fetchShortlistPlayers,
    staleTime: 60 * 1000,
  });
}
