"use client";

import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
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
  return useInfiniteQuery({
    queryKey: ["players", "search", filters],
    queryFn: ({ pageParam = 0 }) => searchPlayers(supabase, filters, pageParam),
    initialPageParam: 0,
    placeholderData: keepPreviousData,
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

export function useNearbyPlayers() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["players", "nearby"],
    queryFn: () => getNearbyPlayers(supabase),
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
