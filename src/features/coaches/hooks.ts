"use client";

import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
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

export function useCoachSearch(filters: CoachSearchFilters) {
  const supabase = createClient();
  return useInfiniteQuery({
    queryKey: ["coaches", "search", filters],
    queryFn: ({ pageParam = 0 }) => searchCoaches(supabase, filters, pageParam),
    initialPageParam: 0,
    placeholderData: keepPreviousData,
    getNextPageParam: (lastPage, _, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
  });
}

export function useFeaturedCoaches() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["coaches", "featured"],
    queryFn: () => getFeaturedCoaches(supabase),
  });
}

export function useRecruitingCoaches() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["coaches", "recruiting"],
    queryFn: () => getCoachesWithRecruitingNeeds(supabase),
  });
}

export function useAllCoaches(limit = 12) {
  const supabase = createClient();
  return useQuery({
    queryKey: ["coaches", "all", limit],
    queryFn: () => listCoaches(supabase, limit),
  });
}
