"use client";

import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { usePostcodeLocations } from "@/features/locations/hooks";
import { useCoachSearchLocation } from "@/features/coaches/hooks";
import { getCoachSearchLocation } from "@/lib/geo/location-radius";
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

const DISCOVER_SECTION_STALE_MS = 5 * 60 * 1000;
const PLAYER_SEARCH_STALE_MS = 60 * 1000;

/** Player Explore passes excludeUserId; coach Discover omits it — only behavioral diff vs coach. */
export type PlayerListOptions = {
  enabled?: boolean;
  excludeUserId?: string;
};

export type NearbyPlayersOptions = PlayerListOptions & {
  locationSource?: "coach" | "player";
};

export function usePlayerDistrict(enabled = true) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["player-district"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return {
          association_id: null as string | null,
          postcode: null as string | null,
          suburb: null as string | null,
          latitude: null as number | null,
          longitude: null as number | null,
        };
      }

      const { data, error } = await supabase
        .from("player_profiles")
        .select("association_id, postcode, suburb, latitude, longitude")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return {
        association_id: data?.association_id ?? null,
        postcode: data?.postcode ?? null,
        suburb: data?.suburb ?? null,
        latitude: data?.latitude ?? null,
        longitude: data?.longitude ?? null,
      };
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlayerSearchLocation(enabled = true) {
  const district = usePlayerDistrict(enabled);
  const locations = usePostcodeLocations();

  const location =
    district.data && locations.data
      ? getCoachSearchLocation(
          {
            latitude: district.data.latitude,
            longitude: district.data.longitude,
            postcode: district.data.postcode,
            suburb: district.data.suburb,
            association_id: district.data.association_id,
          },
          locations.data.locationsMap,
          locations.data.associationPostcodes
        )
      : null;

  return {
    location,
    label: location?.label ?? null,
    canSearchNearby: !!location,
    isLoading: enabled && (district.isLoading || locations.isLoading),
    playerDistrict: district.data,
  };
}

function stablePlayerSearchFiltersKey(filters: PlayerSearchFilters): string {
  const entries = Object.entries(filters).filter(
    ([, value]) => value !== undefined && value !== ""
  );
  entries.sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(Object.fromEntries(entries));
}

export function usePlayerSearch(
  filters: PlayerSearchFilters,
  options?: PlayerListOptions
) {
  const supabase = createClient();
  const locations = usePostcodeLocations();
  const nearbyActive =
    filters.radiusKm != null && filters.latitude != null && filters.longitude != null;
  const searchEnabled = options?.enabled ?? true;
  const excludeUserId = options?.excludeUserId;

  const postcodeContextReady = !nearbyActive || !!locations.data;

  return useInfiniteQuery({
    queryKey: [
      "players",
      "search",
      stablePlayerSearchFiltersKey(filters),
      excludeUserId,
      postcodeContextReady,
    ],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await searchPlayers(
        supabase,
        filters,
        pageParam,
        locations.data,
        excludeUserId
      );
      if (result.error) {
        const err = result.error as { message?: string; details?: string };
        const message =
          err instanceof Error
            ? err.message
            : err.message ?? err.details ?? String(err);
        throw new Error(message);
      }
      return result;
    },
    initialPageParam: 0,
    staleTime: PLAYER_SEARCH_STALE_MS,
    placeholderData: keepPreviousData,
    enabled: searchEnabled && postcodeContextReady,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
  });
}

export function useFeaturedPlayers(options?: PlayerListOptions) {
  const supabase = createClient();
  const enabled = options?.enabled ?? true;
  const excludeUserId = options?.excludeUserId;
  return useQuery({
    queryKey: ["players", "featured", excludeUserId],
    queryFn: () => getFeaturedPlayers(supabase, excludeUserId),
    enabled,
    staleTime: DISCOVER_SECTION_STALE_MS,
  });
}

export function useTrendingPlayers(options?: PlayerListOptions) {
  const supabase = createClient();
  const enabled = options?.enabled ?? true;
  const excludeUserId = options?.excludeUserId;
  return useQuery({
    queryKey: ["players", "trending", excludeUserId],
    queryFn: () => getTrendingPlayers(supabase, excludeUserId),
    enabled,
    staleTime: DISCOVER_SECTION_STALE_MS,
  });
}

export function useNearbyPlayers(
  radiusKm = DEFAULT_RADIUS_KM,
  options?: NearbyPlayersOptions
) {
  const supabase = createClient();
  const locations = usePostcodeLocations();
  const enabled = options?.enabled ?? true;
  const excludeUserId = options?.excludeUserId;
  const locationSource = options?.locationSource ?? "coach";
  const coachEnabled = enabled && locationSource === "coach";
  const playerEnabled = enabled && locationSource === "player";
  const coach = useCoachSearchLocation(coachEnabled);
  const player = usePlayerSearchLocation(playerEnabled);
  const searchLocation = locationSource === "player" ? player : coach;

  const originPostcode =
    locationSource === "player"
      ? player.playerDistrict?.postcode
      : coach.coachDistrict?.postcode;

  return useQuery({
    queryKey: [
      "players",
      "nearby",
      locationSource,
      radiusKm,
      searchLocation.location?.lat,
      searchLocation.location?.lng,
      excludeUserId,
    ],
    queryFn: () =>
      getNearbyPlayers(
        supabase,
        searchLocation.location,
        locations.data,
        radiusKm,
        originPostcode,
        excludeUserId
      ),
    enabled: enabled && !!searchLocation.location && !!locations.data,
    staleTime: DISCOVER_SECTION_STALE_MS,
  });
}

export function useRecentlyActive(options?: PlayerListOptions) {
  const supabase = createClient();
  const enabled = options?.enabled ?? true;
  const excludeUserId = options?.excludeUserId;
  return useQuery({
    queryKey: ["players", "active", excludeUserId],
    queryFn: () => getRecentlyActive(supabase, excludeUserId),
    enabled,
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
