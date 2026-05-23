"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  getAssociationPostcodeMap,
  listPostcodeLocations,
} from "./postcode-locations-repository";

export function usePostcodeLocations() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["postcode-locations"],
    queryFn: async () => {
      const [locationsMap, associationPostcodes] = await Promise.all([
        listPostcodeLocations(supabase),
        getAssociationPostcodeMap(supabase),
      ]);
      return { locationsMap, associationPostcodes };
    },
    staleTime: 60 * 60 * 1000,
    refetchOnMount: true,
  });
}
