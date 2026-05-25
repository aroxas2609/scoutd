import type { PlayerProfile, UserRole } from "@/types/database";

export function canViewPlayerFfaNumber(viewerRole: UserRole | null | undefined): boolean {
  return viewerRole === "coach" || viewerRole === "admin";
}

export function playerFfaNumber(player: PlayerProfile): string | null {
  return player.ffa_number?.trim() || null;
}

/** Hide coach-only fields from API responses shown to other players. */
export function redactPlayerPrivateFields(
  player: PlayerProfile,
  viewerRole: UserRole | null | undefined
): PlayerProfile {
  if (canViewPlayerFfaNumber(viewerRole)) return player;
  if (!player.ffa_number) return player;
  return { ...player, ffa_number: null };
}

export function redactPlayerList(
  players: PlayerProfile[],
  viewerRole: UserRole | null | undefined
): PlayerProfile[] {
  if (canViewPlayerFfaNumber(viewerRole)) return players;
  return players.map((p) => redactPlayerPrivateFields(p, viewerRole));
}
