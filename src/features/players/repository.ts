import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlayerProfile, PlayerSearchFilters } from "@/types/database";

const PAGE_SIZE = 12;

export async function searchPlayers(
  supabase: SupabaseClient,
  filters: PlayerSearchFilters,
  page = 0
) {
  let query = supabase
    .from("player_profiles")
    .select(
      `
      *,
      profiles!inner(id, full_name, avatar_url, last_active_at)
    `
    )
    .order("updated_at", { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (filters.query) {
    query = query.or(
      `current_club.ilike.%${filters.query}%,location_public.ilike.%${filters.query}%,profiles.full_name.ilike.%${filters.query}%`
    );
  }
  if (filters.position) query = query.eq("position", filters.position);
  if (filters.foot) query = query.eq("dominant_foot", filters.foot);
  if (filters.availability) query = query.eq("availability", filters.availability);
  if (filters.experienceLevel)
    query = query.eq("experience_level", filters.experienceLevel);
  if (filters.willingToTravel !== undefined)
    query = query.eq("willing_to_travel", filters.willingToTravel);
  if (filters.ageMin) query = query.gte("age", filters.ageMin);
  if (filters.ageMax) query = query.lte("age", filters.ageMax);
  if (filters.gender) query = query.eq("gender", filters.gender);

  const { data, error } = await query;
  return { data: data as PlayerProfile[] | null, error, hasMore: (data?.length ?? 0) === PAGE_SIZE };
}

export async function getPlayerById(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("player_profiles")
    .select(`*, profiles!inner(*)`)
    .eq("user_id", userId)
    .single();
  return { data: data as PlayerProfile | null, error };
}

export async function getFeaturedPlayers(supabase: SupabaseClient) {
  const { data: featured } = await supabase
    .from("featured_entities")
    .select("entity_id")
    .eq("entity_type", "player")
    .order("sort_order");

  if (!featured?.length) {
    return searchPlayers(supabase, {}, 0);
  }

  const ids = featured.map((f) => f.entity_id);
  const { data, error } = await supabase
    .from("player_profiles")
    .select(`*, profiles!inner(*)`)
    .in("user_id", ids);

  return { data: data as PlayerProfile[] | null, error };
}

export async function getTrendingPlayers(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("player_profiles")
    .select(`*, profiles!inner(*)`)
    .order("completion_score", { ascending: false })
    .limit(8);
  return { data: data as PlayerProfile[] | null, error };
}

export async function getNearbyPlayers(
  supabase: SupabaseClient,
  lat?: number,
  lng?: number
) {
  const { data, error } = await supabase
    .from("player_profiles")
    .select(`*, profiles!inner(*)`)
    .not("latitude", "is", null)
    .order("updated_at", { ascending: false })
    .limit(8);
  return { data: data as PlayerProfile[] | null, error, lat, lng };
}

export async function getRecentlyActive(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("player_profiles")
    .select(`*, profiles!inner(*)`)
    .order("profiles(last_active_at)", { ascending: false })
    .limit(8);
  return { data: data as PlayerProfile[] | null, error };
}

export function computeCompletionScore(profile: Partial<PlayerProfile>): number {
  const fields = [
    profile.age ?? profile.date_of_birth,
    profile.location,
    profile.position,
    profile.dominant_foot,
    profile.current_club,
    profile.experience_level,
    profile.bio,
    profile.has_highlights,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}
