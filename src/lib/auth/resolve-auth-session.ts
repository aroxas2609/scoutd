import type { QueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  AUTH_USER_ID_KEY,
  viewerRoleQueryKey,
} from "@/features/auth/auth-query-cache";
import type { UserRole } from "@/types/database";

export type ResolvedAuthSession = {
  userId: string;
  role: UserRole | null;
};

/** Prefer React Query auth cache; fall back to Supabase once. */
export async function resolveAuthSession(
  qc: QueryClient
): Promise<ResolvedAuthSession | null> {
  const cachedUserId = qc.getQueryData<string | null>(AUTH_USER_ID_KEY);
  if (cachedUserId) {
    const viewer = qc.getQueryData<{
      userId: string | null;
      role: UserRole | null;
    }>(viewerRoleQueryKey(cachedUserId));
    if (viewer?.userId === cachedUserId) {
      return { userId: cachedUserId, role: viewer.role };
    }
    return { userId: cachedUserId, role: null };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role as UserRole | null) ?? null;
  return { userId: user.id, role };
}
