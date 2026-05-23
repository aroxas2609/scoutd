"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
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

export function usePlayerSearch(filters: PlayerSearchFilters) {
  const supabase = createClient();
  const locations = usePostcodeLocations();
  const nearbyActive =
    filters.radiusKm != null && filters.latitude != null && filters.longitude != null;

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
    staleTime: 0,
    refetchOnMount: true,
    enabled: !nearbyActive || !!locations.data,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
  });
}

export function useFeaturedPlayers() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["players", "featured"],
    queryFn: () => getFeaturedPlayers(supabase),
  });
}

export function useTrendingPlayers() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["players", "trending"],
    queryFn: () => getTrendingPlayers(supabase),
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
  });
}

export function useRecentlyActive() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["players", "active"],
    queryFn: () => getRecentlyActive(supabase),
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
