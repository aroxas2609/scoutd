import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "@/types/database";

export type MessageParticipant = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole | null;
  email: string | null;
  club_name: string | null;
};

export function participantDisplayName(participant: MessageParticipant | null | undefined) {
  if (!participant) return "Scoutd user";
  const name = participant.full_name?.trim();
  const club = participant.club_name?.trim();

  if (participant.role === "coach") {
    if (club) return club;
    if (name) return name;
  } else {
    if (name && club && name === club) return club;
    if (name) return name;
    if (club) return club;
  }
  if (participant.email) {
    const local = participant.email.split("@")[0]?.replace(/[.+_-]/g, " ").trim();
    if (local) return local;
  }
  if (participant.role === "coach") return "Coach";
  if (participant.role === "player") return "Player";
  return "Scoutd user";
}

/** Name shown above incoming chat bubbles (coach personal name, not club). */
export function participantSenderLabel(participant: MessageParticipant | null | undefined) {
  if (!participant) return "Scoutd user";
  const name = participant.full_name?.trim();
  const club = participant.club_name?.trim();
  if (participant.role === "coach") {
    if (name && club && name !== club) return name;
    if (club) return club;
    if (name) return name;
  }
  return participantDisplayName(participant);
}

export function participantAvatarUrl(participant: MessageParticipant | null | undefined) {
  return participant?.avatar_url ?? null;
}

export async function fetchParticipantsByUserIds(
  supabase: SupabaseClient,
  userIds: string[]
): Promise<Map<string, MessageParticipant>> {
  const map = new Map<string, MessageParticipant>();
  if (!userIds.length) return map;

  const uniqueIds = [...new Set(userIds)];

  const [{ data: profiles }, { data: coaches }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role, email")
      .in("id", uniqueIds),
    supabase
      .from("coach_profiles")
      .select("user_id, club_name, logo_url")
      .in("user_id", uniqueIds),
  ]);

  const coachById = new Map((coaches ?? []).map((c) => [c.user_id, c]));

  for (const id of uniqueIds) {
    const profile = profiles?.find((p) => p.id === id);
    const coach = coachById.get(id);
    map.set(id, {
      id,
      full_name: profile?.full_name ?? null,
      avatar_url: profile?.avatar_url ?? coach?.logo_url ?? null,
      role: (profile?.role as UserRole | null) ?? null,
      email: profile?.email ?? null,
      club_name: coach?.club_name ?? null,
    });
  }

  return map;
}
