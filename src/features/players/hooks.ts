"use client";

import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { usePostcodeLocations } from "@/features/locations/hooks";
import { useCoachSearchLocation } from "@/features/coaches/hooks";
import { DEFAULT_RADIUS_KM } from "@/lib/geo/location-radius";
import {
  searchPlayers,
  getFeaturedPlayers,
  getTrendingPlayers,
  getNearbyPlayers,
  getRecentlyActive,
  getPlayerById,
} from "./repository";
import type { PlayerSearchFilters } from "@/types/database";
import { shouldRunPlayerSearch } from "./search-enabled";

const DISCOVER_SECTION_STALE_MS = 5 * 60 * 1000;
const PLAYER_SEARCH_STALE_MS = 60 * 1000;

export function usePlayerSearch(
  filters: PlayerSearchFilters,
  options?: { enabled?: boolean }
) {
  const supabase = createClient();
  const locations = usePostcodeLocations();
  const nearbyActive =
    filters.radiusKm != null && filters.latitude != null && filters.longitude != null;
  const searchEnabled = options?.enabled ?? true;

  return useInfiniteQuery({
    queryKey: ["players", "search", filters],
    queryFn: ({ pageParam = 0 }) =>
      searchPlayers(
        supabase,
        filters,
        pageParam,
        nearbyActive && locations.data ? locations.data : undefined
      ),
    initialPageParam: 0,
    staleTime: PLAYER_SEARCH_STALE_MS,
    placeholderData: keepPreviousData,
    enabled:
      searchEnabled && (!nearbyActive || !!locations.data),
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
  });
}

export function useFeaturedPlayers() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["players", "featured"],
    queryFn: () => getFeaturedPlayers(supabase),
    staleTime: DISCOVER_SECTION_STALE_MS,
  });
}

export function useTrendingPlayers() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["players", "trending"],
    queryFn: () => getTrendingPlayers(supabase),
    staleTime: DISCOVER_SECTION_STALE_MS,
  });
}

export function useNearbyPlayers(radiusKm = DEFAULT_RADIUS_KM) {
  const supabase = createClient();
  const locations = usePostcodeLocations();
  const coach = useCoachSearchLocation();

  return useQuery({
    queryKey: ["players", "nearby", radiusKm, coach.location?.lat, coach.location?.lng],
    queryFn: () =>
      getNearbyPlayers(
        supabase,
        coach.location,
        locations.data!,
        radiusKm,
        coach.coachDistrict?.postcode
      ),
    enabled: !!coach.location && !!locations.data,
    staleTime: DISCOVER_SECTION_STALE_MS,
  });
}

export function useRecentlyActive() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["players", "active"],
    queryFn: () => getRecentlyActive(supabase),
    staleTime: DISCOVER_SECTION_STALE_MS,
  });
}

export function usePlayer(userId: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["player", userId],
    queryFn: () => getPlayerById(supabase, userId),
    enabled: !!userId,
  });
}
