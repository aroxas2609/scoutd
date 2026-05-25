import type { SupabaseClient } from "@supabase/supabase-js";
import type { CoachProfile, CoachSearchFilters } from "@/types/database";

const PAGE_SIZE = 12;

const coachSelect = `
  *,
  profiles!inner(id, full_name, avatar_url, last_active_at, role)
`;

export async function getCoachById(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("coach_profiles")
    .select(coachSelect)
    .eq("user_id", userId)
    .single();
  return { data: data as CoachProfile | null, error };
}

function applyCoachFilters(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  filters: CoachSearchFilters
) {
  if (filters.query?.trim()) {
    const q = filters.query.trim();
    query = query.or(
      `club_name.ilike.%${q}%,location.ilike.%${q}%,address.ilike.%${q}%,league.ilike.%${q}%,recruiting_needs.ilike.%${q}%`
    );
  }
  if (filters.location?.trim()) {
    query = query.ilike("location", `%${filters.location.trim()}%`);
  }
  if (filters.league?.trim()) {
    query = query.eq("league", filters.league.trim());
  }
  return query;
}

export async function searchCoaches(
  supabase: SupabaseClient,
  filters: CoachSearchFilters,
  page = 0
) {
  let query = supabase.from("coach_profiles").select(coachSelect);
  query = applyCoachFilters(query, filters);

  const { data, error } = await query
    .order("club_name", { ascending: true })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
  return {
    data: data as CoachProfile[] | null,
    error,
    hasMore: (data?.length ?? 0) === PAGE_SIZE,
  };
}

export async function listCoaches(supabase: SupabaseClient, limit = 8) {
  const { data, error } = await supabase
    .from("coach_profiles")
    .select(coachSelect)
    .order("club_name", { ascending: true })
    .limit(limit);

  return { data: data as CoachProfile[] | null, error };
}

export async function getFeaturedCoaches(supabase: SupabaseClient) {
  const { data: featured } = await supabase
    .from("featured_entities")
    .select("entity_id")
    .eq("entity_type", "coach")
    .order("sort_order");

  if (!featured?.length) {
    return listCoaches(supabase, 8);
  }

  const ids = featured.map((f) => f.entity_id);
  const { data, error } = await supabase
    .from("coach_profiles")
    .select(coachSelect)
    .in("user_id", ids);

  return { data: data as CoachProfile[] | null, error };
}

export async function getCoachesWithRecruitingNeeds(supabase: SupabaseClient, limit = 8) {
  const { data, error } = await supabase
    .from("coach_profiles")
    .select(coachSelect)
    .not("recruiting_needs", "is", null)
    .order("club_name", { ascending: true })
    .limit(limit);

  return { data: data as CoachProfile[] | null, error };
}
