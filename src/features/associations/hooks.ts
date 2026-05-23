"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { isValidAustralianPostcode, normalisePostcode } from "@/lib/football/association-postcodes";
import { listAssociations } from "./repository";
import type { AssociationSuggestion } from "./repository";

export function useAssociations() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["associations"],
    queryFn: async () => {
      const { data, error } = await listAssociations(supabase);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60 * 60 * 1000,
  });
}

export function useAssociationSuggestion(postcode: string | null | undefined) {
  const normalised = normalisePostcode(postcode);
  const enabled = isValidAustralianPostcode(postcode);

  return useQuery({
    queryKey: ["association-suggestion", normalised],
    queryFn: async (): Promise<AssociationSuggestion | null> => {
      if (!normalised) return null;
      const res = await fetch(
        `/api/associations/suggest?postcode=${encodeURIComponent(normalised)}`
      );
      if (!res.ok) return null;
      const data = (await res.json()) as AssociationSuggestion;
      return data.associationId && data.associationName ? data : null;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
