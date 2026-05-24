"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { resolveAuthSession } from "@/lib/auth/resolve-auth-session";
import type { PlayerProfile } from "@/types/database";

export async function fetchShortlistPlayersForUser(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<PlayerProfile[]> {
  const { data: saved } = await supabase
    .from("saved_players")
    .select("player_id")
    .eq("coach_id", userId);

  if (!saved?.length) return [];

  const ids = saved.map((s) => s.player_id);
  const { data } = await supabase
    .from("player_profiles")
    .select("*, profiles!inner(*)")
    .in("user_id", ids);

  return (data ?? []) as PlayerProfile[];
}

export function useShortlistPlayers() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useQuery({
    queryKey: ["shortlist"],
    queryFn: async () => {
      const session = await resolveAuthSession(qc);
      if (!session) return [];
      return fetchShortlistPlayersForUser(supabase, session.userId);
    },
    staleTime: 60 * 1000,
  });
}
