import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildPlayerLocationOrClause,
  escapeIlikePattern,
  pickNearbySearchPostcodes,
} from "@/lib/football/player-search-query";
import {
  calculateDistanceKm,
  DEFAULT_RADIUS_KM,
  filterPlayersByRadius,
  getLatLngBoundingBox,
  getPlayerSearchLocation,
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
/** Lat/lng bbox pre-fetch; refined in memory with haversine (not nearest — see postcode merge). */
const NEARBY_COORD_LIMIT = 200;
/** Postcode OR fallback when few players have stored coordinates. */
const NEARBY_POSTCODE_FALLBACK_LIMIT = 100;

/** Card / discover list fields only — smaller payloads than `*`. */
const PLAYER_LIST_SELECT = `
  user_id,
  age,
  suburb,
  postcode,
  position,
  availability,
  has_highlights,
  verified_at,
  latitude,
  longitude,
  completion_score,
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

/** Player Explore hides self after fetch — same Supabase query as coach Discover. */
export function withoutExcludedUser<T extends { user_id: string }>(
  rows: T[],
  excludeUserId?: string
): T[] {
  if (!excludeUserId) return rows;
  return rows.filter((row) => row.user_id !== excludeUserId);
}

/** Slim list select rows are a subset of PlayerProfile; safe for cards and search UI. */
function asPlayerList(
  rows: unknown[] | null | undefined,
  excludeUserId?: string
): PlayerProfile[] {
  return withoutExcludedUser(rows as unknown as PlayerProfile[], excludeUserId);
}

/** Coach Discover name lookup (async, separate from the player_profiles builder). */
async function fetchNameMatchUserIds(
  supabase: SupabaseClient,
  term: string
): Promise<string[]> {
  const escaped = escapeIlikePattern(term.trim());
  if (!escaped) return [];

  const { data: nameMatches } = await supabase
    .from("profiles")
    .select("id")
    .ilike("full_name", `%${escaped}%`)
    .limit(50);

  return (nameMatches ?? []).map((row) => row.id as string);
}

/** Sync filters only — keeps PostgREST builder chain valid for .order() / .range(). */
function applyPlayerSearchFilters(
  query: PlayerQuery,
  filters: PlayerSearchFilters,
  nameMatchUserIds: string[]
): PlayerQuery {
  if (filters.query?.trim()) {
    const term = filters.query.trim();
    const locationOr = buildPlayerLocationOrClause(term);
    if (nameMatchUserIds.length > 0) {
      query = query.in("user_id", nameMatchUserIds);
    } else if (locationOr) {
      query = query.or(locationOr);
    }
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

async function resolveNameIdsForFilters(
  supabase: SupabaseClient,
  filters: PlayerSearchFilters
): Promise<string[]> {
  const term = filters.query?.trim();
  if (!term) return [];
  return fetchNameMatchUserIds(supabase, term);
}

function hasNearbyCoords(filters: PlayerSearchFilters): boolean {
  return (
    filters.radiusKm != null &&
    filters.latitude != null &&
    filters.longitude != null
  );
}

/** Geo pre-filter only when browsing nearby without a name/location text query. */
function isGeoNearbySearch(filters: PlayerSearchFilters): boolean {
  return hasNearbyCoords(filters) && !filters.query?.trim();
}

function attachDistanceToPlayers(
  players: PlayerProfile[],
  origin: SearchLocation,
  context?: PlayerSearchContext
): PlayerWithDistance[] {
  return players.map((player) => {
    let distanceKm: number | undefined;
    if (player.latitude != null && player.longitude != null) {
      distanceKm = calculateDistanceKm(
        origin.lat,
        origin.lng,
        player.latitude,
        player.longitude
      );
    } else if (context) {
      const loc = getPlayerSearchLocation(
        player,
        context.locationsMap,
        context.associationPostcodes
      );
      if (loc) {
        distanceKm = calculateDistanceKm(origin.lat, origin.lng, loc.lat, loc.lng);
      }
    }
    return { ...player, distanceKm };
  });
}

function nearbyOrigin(filters: PlayerSearchFilters): SearchLocation {
  return {
    lat: filters.latitude!,
    lng: filters.longitude!,
    label: "Club",
    source: "profile",
  };
}

function filterPlayersByStoredCoords(
  players: PlayerProfile[],
  origin: SearchLocation,
  radiusKm: number
): PlayerWithDistance[] {
  const within: PlayerWithDistance[] = [];
  for (const player of players) {
    if (player.latitude == null || player.longitude == null) continue;
    const distanceKm = calculateDistanceKm(
      origin.lat,
      origin.lng,
      player.latitude,
      player.longitude
    );
    if (distanceKm <= radiusKm) {
      within.push({ ...player, distanceKm });
    }
  }
  return within;
}

function paginateNearbyResults(
  filtered: PlayerWithDistance[],
  page: number,
  sortByNearest: boolean | undefined
) {
  const sorted =
    sortByNearest !== false ? sortPlayersByDistance(filtered) : filtered;
  const start = page * PAGE_SIZE;
  const pageData = sorted.slice(start, start + PAGE_SIZE);
  return {
    data: pageData,
    hasMore: sorted.length > start + PAGE_SIZE,
  };
}

async function fetchNearbyByCoords(
  supabase: SupabaseClient,
  filters: PlayerSearchFilters,
  excludeUserId?: string,
  nameMatchUserIds?: string[]
) {
  const origin = nearbyOrigin(filters);
  const box = getLatLngBoundingBox(origin.lat, origin.lng, filters.radiusKm!);

  let query = supabase
    .from("player_profiles")
    .select(PLAYER_LIST_SELECT)
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .gte("latitude", box.minLat)
    .lte("latitude", box.maxLat)
    .gte("longitude", box.minLng)
    .lte("longitude", box.maxLng);

  const nameIds =
    nameMatchUserIds ?? (await resolveNameIdsForFilters(supabase, filters));
  query = applyPlayerSearchFilters(query, filters, nameIds);
  query = query.limit(NEARBY_COORD_LIMIT);

  const { data, error } = await query;
  const filtered = sortPlayersByDistance(
    filterPlayersByStoredCoords(
      asPlayerList(data, excludeUserId),
      origin,
      filters.radiusKm!
    )
  );

  return { filtered, error };
}

async function fetchNearbyByPostcodes(
  supabase: SupabaseClient,
  filters: PlayerSearchFilters,
  context: PlayerSearchContext | undefined,
  excludeUserId?: string,
  nameMatchUserIds?: string[]
) {
  if (!context?.locationsMap?.size) {
    return { filtered: [] as PlayerWithDistance[], error: null };
  }

  const origin = nearbyOrigin(filters);
  const postcodesInRadius = withOriginPostcode(
    getPostcodesWithinRadius(origin, filters.radiusKm!, context.locationsMap),
    filters.originPostcode
  );
  const postcodes = pickNearbySearchPostcodes(
    postcodesInRadius,
    filters.radiusKm!,
    origin,
    context.locationsMap
  );
  if (!postcodes.length) {
    return { filtered: [] as PlayerWithDistance[], error: null };
  }

  let query = supabase
    .from("player_profiles")
    .select(PLAYER_LIST_SELECT)
    .in("postcode", postcodes);

  const nameIds =
    nameMatchUserIds ?? (await resolveNameIdsForFilters(supabase, filters));
  query = applyPlayerSearchFilters(query, filters, nameIds);
  query = query.limit(NEARBY_POSTCODE_FALLBACK_LIMIT);

  const { data, error } = await query;
  const filtered = sortPlayersByDistance(
    filterPlayersByRadius(
      asPlayerList(data, excludeUserId),
      origin,
      filters.radiusKm!,
      context.locationsMap,
      context.associationPostcodes
    )
  );

  return { filtered, error };
}

/** Enough coord matches — skip second postcode query on discover/search. */
const NEARBY_POSTCODE_SKIP_THRESHOLD = PAGE_SIZE;

function mergeNearbyResults(
  primary: PlayerWithDistance[],
  secondary: PlayerWithDistance[]
): PlayerWithDistance[] {
  const seen = new Set(primary.map((p) => p.user_id));
  const merged = [...primary];
  for (const player of secondary) {
    if (seen.has(player.user_id)) continue;
    seen.add(player.user_id);
    merged.push(player);
  }
  return merged;
}

export async function searchPlayers(
  supabase: SupabaseClient,
  filters: PlayerSearchFilters,
  page = 0,
  context?: PlayerSearchContext,
  excludeUserId?: string
) {
  if (isGeoNearbySearch(filters)) {
    const nameIds = await resolveNameIdsForFilters(supabase, filters);
    const { filtered: coordMatches, error: coordError } = await fetchNearbyByCoords(
      supabase,
      filters,
      excludeUserId,
      nameIds
    );

    let filtered = coordMatches;
    let error = coordError;

    // Postcode fallback when coord cap returns few rows (many players lack lat/lng).
    if (
      page === 0 &&
      context?.locationsMap.size &&
      filtered.length < NEARBY_POSTCODE_SKIP_THRESHOLD
    ) {
      const { filtered: postcodeMatches, error: postcodeError } =
        await fetchNearbyByPostcodes(
          supabase,
          filters,
          context,
          excludeUserId,
          nameIds
        );
      filtered = mergeNearbyResults(filtered, postcodeMatches);
      error = error ?? postcodeError;
    }

    const { data, hasMore } = paginateNearbyResults(
      filtered,
      page,
      filters.sortByNearest
    );

    return { data, error, hasMore };
  }

  const nameIds = await resolveNameIdsForFilters(supabase, filters);
  let query = applyPlayerSearchFilters(
    supabase.from("player_profiles").select(PLAYER_LIST_SELECT),
    filters,
    nameIds
  );

  const { data, error } = await query
    .order("updated_at", { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
  let results = asPlayerList(data, excludeUserId);

  if (hasNearbyCoords(filters)) {
    let withDistance = attachDistanceToPlayers(
      results,
      nearbyOrigin(filters),
      context
    );
    if (filters.sortByNearest !== false) {
      withDistance = sortPlayersByDistance(withDistance);
    }
    return {
      data: withDistance,
      error,
      hasMore: (data?.length ?? 0) === PAGE_SIZE,
    };
  }

  return {
    data: results,
    error,
    hasMore: (data?.length ?? 0) === PAGE_SIZE,
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

export async function getFeaturedPlayers(
  supabase: SupabaseClient,
  excludeUserId?: string
) {
  const { data: featured } = await supabase
    .from("featured_entities")
    .select("entity_id")
    .eq("entity_type", "player")
    .order("sort_order");

  if (!featured?.length) {
    return searchPlayers(supabase, {}, 0, undefined, excludeUserId);
  }

  const ids = featured
    .map((f) => f.entity_id)
    .filter((id) => id !== excludeUserId);
  if (!ids.length) {
    return { data: [] as PlayerProfile[], error: null };
  }

  let query = supabase.from("player_profiles").select(PLAYER_LIST_SELECT).in("user_id", ids);
  const { data, error } = await query;

  return { data: asPlayerList(data, excludeUserId), error };
}

export async function getTrendingPlayers(
  supabase: SupabaseClient,
  excludeUserId?: string
) {
  const { data, error } = await supabase
    .from("player_profiles")
    .select(PLAYER_LIST_SELECT)
    .order("completion_score", { ascending: false })
    .limit(8);
  return { data: asPlayerList(data, excludeUserId), error };
}

export async function getNearbyPlayers(
  supabase: SupabaseClient,
  coachLocation: SearchLocation | null,
  context: PlayerSearchContext | undefined,
  radiusKm = DEFAULT_RADIUS_KM,
  originPostcode?: string | null,
  excludeUserId?: string
): Promise<{ data: PlayerWithDistance[]; error: unknown }> {
  if (!coachLocation) {
    return { data: [], error: null };
  }

  const filters: PlayerSearchFilters = {
    radiusKm,
    latitude: coachLocation.lat,
    longitude: coachLocation.lng,
    originPostcode: originPostcode ?? undefined,
    sortByNearest: true,
  };

  const nameIds = await resolveNameIdsForFilters(supabase, filters);
  const { filtered, error } = await fetchNearbyByCoords(
    supabase,
    filters,
    excludeUserId,
    nameIds
  );
  let results = filtered;

  if (
    context?.locationsMap.size &&
    results.length < NEARBY_POSTCODE_SKIP_THRESHOLD
  ) {
    const { filtered: postcodeMatches, error: postcodeError } =
      await fetchNearbyByPostcodes(supabase, filters, context, excludeUserId, nameIds);
    results = mergeNearbyResults(results, postcodeMatches);
    return {
      data: sortPlayersByDistance(results).slice(0, 8),
      error: error ?? postcodeError,
    };
  }

  return {
    data: sortPlayersByDistance(results).slice(0, 8),
    error,
  };
}

export async function getRecentlyActive(
  supabase: SupabaseClient,
  excludeUserId?: string
) {
  const { data, error } = await supabase
    .from("player_profiles")
    .select(PLAYER_LIST_SELECT)
    .order("profiles(last_active_at)", { ascending: false })
    .limit(8);
  return { data: asPlayerList(data, excludeUserId), error };
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
