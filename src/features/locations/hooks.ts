"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  getAssociationPostcodeMap,
  listPostcodeLocations,
} from "./postcode-locations-repository";

export const POSTCODE_LOCATIONS_QUERY_KEY = ["postcode-locations"] as const;
const POSTCODE_LOCATIONS_STALE_MS = 60 * 60 * 1000;
const POSTCODE_LOCATIONS_GC_MS = 24 * 60 * 60 * 1000;

export async function fetchPostcodeLocationsData() {
  const supabase = createClient();
  const [locationsMap, associationPostcodes] = await Promise.all([
    listPostcodeLocations(supabase),
    getAssociationPostcodeMap(supabase),
  ]);
  return { locationsMap, associationPostcodes };
}

export function usePostcodeLocations() {
  return useQuery({
    queryKey: POSTCODE_LOCATIONS_QUERY_KEY,
    queryFn: fetchPostcodeLocationsData,
    staleTime: POSTCODE_LOCATIONS_STALE_MS,
    gcTime: POSTCODE_LOCATIONS_GC_MS,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
