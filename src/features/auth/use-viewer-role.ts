"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/database";
import {
  AUTH_USER_ID_KEY,
  viewerRoleQueryKey,
} from "./auth-query-cache";

const ROLE_STALE_MS = 5 * 60 * 1000;
const AUTH_SESSION_STALE_MS = 2 * 60 * 1000;

export async function fetchAuthUserId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

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

export function useAuthUserId() {
  return useQuery({
    queryKey: AUTH_USER_ID_KEY,
    queryFn: fetchAuthUserId,
    staleTime: AUTH_SESSION_STALE_MS,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

function useAuthUserIdQuery() {
  return useAuthUserId();
}

export function useViewerRole() {
  const session = useAuthUserIdQuery();
  const sessionUserId = session.data ?? null;

  const roleQuery = useQuery({
    queryKey: viewerRoleQueryKey(session.isSuccess ? sessionUserId : null),
    queryFn: fetchViewerRole,
    enabled: session.isSuccess,
    staleTime: ROLE_STALE_MS,
  });

  const roleMatchesSession =
    session.isSuccess &&
    roleQuery.isSuccess &&
    roleQuery.data?.userId === session.data;

  const data = roleMatchesSession ? roleQuery.data : undefined;

  return {
    ...roleQuery,
    data,
    isPending:
      session.isPending ||
      !session.isSuccess ||
      roleQuery.isPending ||
      (roleQuery.isSuccess && !roleMatchesSession),
    isLoading:
      session.isPending ||
      !session.isSuccess ||
      roleQuery.isPending ||
      (roleQuery.isSuccess && !roleMatchesSession),
  };
}

export function useIsCoachViewer() {
  const { data, isPending, isError } = useViewerRole();
  const role = data?.role ?? null;

  return {
    isCoach: role === "coach",
    isPlayer: role === "player",
    role,
    userId: data?.userId ?? null,
    isLoading: isPending,
    isError,
  };
}
