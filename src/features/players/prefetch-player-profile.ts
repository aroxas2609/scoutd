import type { QueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getPlayerById } from "@/features/players/repository";

const PREFETCH_PLAYER_PROFILES =
  process.env.NEXT_PUBLIC_PREFETCH_PLAYER_PROFILES !== "false";

export function prefetchPlayerProfile(qc: QueryClient, playerId: string) {
  if (!PREFETCH_PLAYER_PROFILES || !playerId) return;

  void qc.prefetchQuery({
    queryKey: ["player", playerId],
    queryFn: () => getPlayerById(createClient(), playerId),
  });
}
