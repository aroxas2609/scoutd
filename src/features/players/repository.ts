import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildNearbyPlayersOrClause,
  buildPlayerSearchOrClause,
  escapeIlikePattern,
} from "@/lib/football/player-search-query";
import {
  DEFAULT_RADIUS_KM,
  filterPlayersByRadius,
  getPostcodesWithinRadius,
  sortPlayersByDistance,
  withOriginPostcode,
  type AssociationPostcodesMap,
  type PostcodeLocationsMap,
  type SearchLocation,
} from "@/lib/geo/location-radius";
import type {
  PlayerProfile,
  PlayerSearchFilters,
  PlayerWithDistance,
} from "@/types/database";

const PAGE_SIZE = 12;
/** MVP: in-memory radius filter after SQL; cap candidates for performance. */
const NEARBY_CANDIDATE_LIMIT = 300;

const PLAYER_LIST_SELECT = `
  *,
  profiles!inner(id, full_name, avatar_url, last_active_at),
  associations(name)
`;

const PLAYER_DETAIL_SELECT = `
  *,
  profiles!inner(id, full_name, avatar_url, last_active_at, email),
  associations(name)
`;

export type PlayerSearchContext = {
  locationsMap: PostcodeLocationsMap;
  associationPostcodes: AssociationPostcodesMap;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PlayerQuery = any;

async function applyPlayerSearchFilters(
  supabase: SupabaseClient,
  query: PlayerQuery,
  filters: PlayerSearchFilters
): Promise<PlayerQuery> {
  if (filters.query?.trim()) {
    const term = filters.query.trim();
    const escaped = escapeIlikePattern(term);
    const { data: nameMatches } = await supabase
      .from("profiles")
      .select("id")
      .ilike("full_name", `%${escaped}%`)
      .limit(50);
    const nameMatchUserIds = (nameMatches ?? []).map((row) => row.id as string);
    const orClause = buildPlayerSearchOrClause(term, nameMatchUserIds);
    if (orClause) query = query.or(orClause);
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
  if (filters.coachAssociationId) {
    query = query.eq("association_id", filters.coachAssociationId);
  }

  return query;
}

function isNearbySearch(
  filters: PlayerSearchFilters,
  context?: PlayerSearchContext
): context is PlayerSearchContext {
  return (
    !!context &&
    filters.radiusKm != null &&
    filters.latitude != null &&
    filters.longitude != null
  );
}

export async function searchPlayers(
  supabase: SupabaseClient,
  filters: PlayerSearchFilters,
  page = 0,
  context?: PlayerSearchContext
) {
  const nearby = isNearbySearch(filters, context);

  let query = supabase
    .from("player_profiles")
    .select(PLAYER_LIST_SELECT)
    .order("updated_at", { ascending: false });

  if (nearby) {
    const coachLocation: SearchLocation = {
      lat: filters.latitude!,
      lng: filters.longitude!,
      label: "Club",
      source: "profile",
    };
    const postcodesInRadius = withOriginPostcode(
      getPostcodesWithinRadius(
        coachLocation,
        filters.radiusKm!,
        context.locationsMap
      ),
      filters.originPostcode
    );
    const nearbyOr = buildNearbyPlayersOrClause(
      postcodesInRadius,
      context.locationsMap
    );
    if (nearbyOr) {
      query = query.or(nearbyOr);
    }
    query = query.limit(NEARBY_CANDIDATE_LIMIT);
  } else {
    query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
  }

  query = await applyPlayerSearchFilters(supabase, query, filters);

  const { data, error } = await query;

  if (!nearby) {
    return {
      data: data as PlayerProfile[] | null,
      error,
      hasMore: (data?.length ?? 0) === PAGE_SIZE,
    };
  }

  const coachLocation: SearchLocation = {
    lat: filters.latitude!,
    lng: filters.longitude!,
    label: "Club",
    source: "profile",
  };

  let filtered: PlayerWithDistance[] = filterPlayersByRadius(
    (data ?? []) as PlayerProfile[],
    coachLocation,
    filters.radiusKm!,
    context.locationsMap,
    context.associationPostcodes
  );

  if (filters.sortByNearest !== false) {
    filtered = sortPlayersByDistance(filtered);
  }

  const start = page * PAGE_SIZE;
  const pageData = filtered.slice(start, start + PAGE_SIZE);

  return {
    data: pageData,
    error,
    hasMore: filtered.length > start + PAGE_SIZE,
  };
}

export async function getPlayerById(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("player_profiles")
    .select(PLAYER_DETAIL_SELECT)
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
    .select(PLAYER_LIST_SELECT)
    .in("user_id", ids);

  return { data: data as PlayerProfile[] | null, error };
}

export async function getTrendingPlayers(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("player_profiles")
    .select(PLAYER_LIST_SELECT)
    .order("completion_score", { ascending: false })
    .limit(8);
  return { data: data as PlayerProfile[] | null, error };
}

export async function getNearbyPlayers(
  supabase: SupabaseClient,
  coachLocation: SearchLocation | null,
  context: PlayerSearchContext,
  radiusKm = DEFAULT_RADIUS_KM,
  originPostcode?: string | null
): Promise<{ data: PlayerWithDistance[]; error: unknown }> {
  if (!coachLocation) {
    return { data: [], error: null };
  }

  const { data, error } = await searchPlayers(
    supabase,
    {
      radiusKm,
      latitude: coachLocation.lat,
      longitude: coachLocation.lng,
      originPostcode: originPostcode ?? undefined,
      sortByNearest: true,
    },
    0,
    context
  );

  return {
    data: (data ?? []).slice(0, 8),
    error,
  };
}

export async function getRecentlyActive(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("player_profiles")
    .select(PLAYER_LIST_SELECT)
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
