import type { QueryClient } from "@tanstack/react-query";

export const AUTH_USER_ID_KEY = ["auth-user-id"] as const;

export function viewerRoleQueryKey(userId: string | null) {
  return ["viewer-role", userId ?? "signed-out"] as const;
}

/** Drop cached session/role so a new login never reuses the previous account's data. */
export function clearAuthQueries(qc: QueryClient) {
  qc.removeQueries({ queryKey: AUTH_USER_ID_KEY });
  qc.removeQueries({ queryKey: ["viewer-role"] });
}
