import type { QueryClient } from "@tanstack/react-query";
import type { UserRole } from "@/types/database";

export const AUTH_USER_ID_KEY = ["auth-user-id"] as const;

export function viewerRoleQueryKey(userId: string | null) {
  return ["viewer-role", userId ?? "signed-out"] as const;
}

/** Drop cached session/role so a new login never reuses the previous account's data. */
export function clearAuthQueries(qc: QueryClient) {
  qc.removeQueries({ queryKey: AUTH_USER_ID_KEY });
  qc.removeQueries({ queryKey: ["viewer-role"] });
}

/** Warm auth/role cache after login so /search does not cold-fetch before render. */
export function seedAuthQueries(
  qc: QueryClient,
  { userId, role }: { userId: string; role: UserRole | null }
) {
  qc.setQueryData(AUTH_USER_ID_KEY, userId);
  qc.setQueryData(viewerRoleQueryKey(userId), { userId, role });
}
