"use client";

import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getCoachSearchLocation } from "@/lib/geo/location-radius";
import { usePostcodeLocations } from "@/features/locations/hooks";
import type { CoachSearchFilters } from "@/types/database";
import {
  getCoachById,
  getCoachesWithRecruitingNeeds,
  getFeaturedCoaches,
  listCoaches,
  searchCoaches,
} from "./repository";

export function useCoach(userId: string) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["coach", userId],
    queryFn: () => getCoachById(supabase, userId),
    enabled: !!userId,
  });
}

export function useCoachSearch(
  filters: CoachSearchFilters,
  options?: { enabled?: boolean }
) {
  const supabase = createClient();
  const searchEnabled = options?.enabled ?? true;

  return useInfiniteQuery({
    queryKey: ["coaches", "search", filters],
    queryFn: ({ pageParam = 0 }) => searchCoaches(supabase, filters, pageParam),
    initialPageParam: 0,
    enabled: searchEnabled,
    placeholderData: keepPreviousData,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
  });
}

const DISCOVER_SECTION_STALE_MS = 5 * 60 * 1000;

export function useFeaturedCoaches() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["coaches", "featured"],
    queryFn: () => getFeaturedCoaches(supabase),
    staleTime: DISCOVER_SECTION_STALE_MS,
  });
}

export function useRecruitingCoaches() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["coaches", "recruiting"],
    queryFn: () => getCoachesWithRecruitingNeeds(supabase),
    staleTime: DISCOVER_SECTION_STALE_MS,
  });
}

export function useCoachDistrict(enabled = true) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["coach-district"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return {
          association_id: null as string | null,
          league: null as string | null,
          postcode: null as string | null,
          suburb: null as string | null,
          latitude: null as number | null,
          longitude: null as number | null,
        };
      }

      const { data, error } = await supabase
        .from("coach_profiles")
        .select("association_id, league, postcode, suburb, latitude, longitude")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return {
        association_id: data?.association_id ?? null,
        league: data?.league ?? null,
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

export function useCoachSearchLocation() {
  const district = useCoachDistrict();
  const locations = usePostcodeLocations();

  const location = district.data && locations.data
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
    isLoading: district.isLoading || locations.isLoading,
    coachDistrict: district.data,
  };
}

export function useAllCoaches(limit = 12) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["coaches", "all", limit],
    queryFn: () => listCoaches(supabase, limit),
    staleTime: DISCOVER_SECTION_STALE_MS,
  });
}
