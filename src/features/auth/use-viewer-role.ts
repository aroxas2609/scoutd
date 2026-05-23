"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/database";

const ROLE_STALE_MS = 5 * 60 * 1000;

export async function fetchViewerRole() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { userId: null as string | null, role: null as UserRole | null };

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return {
    userId: user.id,
    role: (data?.role as UserRole | null) ?? null,
  };
}

export function useViewerRole() {
  const supabase = createClient();
  const qc = useQueryClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      qc.invalidateQueries({ queryKey: ["viewer-role"] });
    });

    return () => subscription.unsubscribe();
  }, [supabase, qc]);

  return useQuery({
    queryKey: ["viewer-role"],
    queryFn: fetchViewerRole,
    staleTime: ROLE_STALE_MS,
  });
}

export function useIsCoachViewer() {
  const { data, isPending, isLoading } = useViewerRole();
  const role = data?.role ?? null;

  return {
    isCoach: role === "coach",
    isPlayer: role === "player",
    role,
    /** True only on first load when role is not cached yet */
    isLoading: (isPending || isLoading) && role === null,
  };
}
