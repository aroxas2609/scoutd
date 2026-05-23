import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "@/types/database";
import { findDirectConversation } from "@/features/messaging/repository";

async function getUserRole(
  supabase: SupabaseClient,
  userId: string
): Promise<UserRole | null> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  return (data?.role as UserRole | null) ?? null;
}

export type ConversationPermissionResult =
  | { allowed: true }
  | { allowed: false; error: string };

/** Who may start (or open) a direct conversation. */
export async function canStartConversation(
  supabase: SupabaseClient,
  actorId: string,
  otherUserId: string
): Promise<ConversationPermissionResult> {
  if (actorId === otherUserId) {
    return { allowed: false, error: "Cannot message yourself" };
  }

  const [actorRole, otherRole] = await Promise.all([
    getUserRole(supabase, actorId),
    getUserRole(supabase, otherUserId),
  ]);

  if (actorRole === "coach" && otherRole === "player") {
    return { allowed: true };
  }

  if (actorRole === "player" && otherRole === "coach") {
    return { allowed: true };
  }

  if (actorRole === "player" && otherRole === "player") {
    const existing = await findDirectConversation(supabase, actorId, otherUserId);
    if (existing) {
      return { allowed: true };
    }
    return {
      allowed: false,
      error: "Players cannot start new chats with other players. Contact coaches from their club profile.",
    };
  }

  return {
    allowed: false,
    error: "Messaging is not available between these accounts.",
  };
}

export async function canSendTrialInvite(
  supabase: SupabaseClient,
  coachId: string,
  playerId: string
): Promise<ConversationPermissionResult> {
  if (coachId === playerId) {
    return { allowed: false, error: "Invalid trial invite" };
  }

  const [coachRole, playerRole] = await Promise.all([
    getUserRole(supabase, coachId),
    getUserRole(supabase, playerId),
  ]);

  if (coachRole !== "coach") {
    return { allowed: false, error: "Only coaches can send trial invites" };
  }

  if (playerRole !== "player") {
    return { allowed: false, error: "Trial invites can only be sent to players" };
  }

  return { allowed: true };
}
