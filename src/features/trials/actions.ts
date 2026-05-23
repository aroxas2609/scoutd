"use server";

import { createClient } from "@/lib/supabase/server";
import { canSendTrialInvite } from "@/lib/auth/recruitment-permissions";
import type { TrialStatus } from "@/types/database";
import { revalidatePath } from "next/cache";

async function getTrialParticipant(
  supabase: Awaited<ReturnType<typeof createClient>>,
  trialId: string,
  userId: string
) {
  const { data: trial, error } = await supabase
    .from("trial_invites")
    .select("id, coach_id, player_id")
    .eq("id", trialId)
    .single();

  if (error || !trial) return { error: "Trial invite not found" as const };
  if (trial.coach_id !== userId && trial.player_id !== userId) {
    return { error: "Not allowed" as const };
  }

  return { trial, role: trial.coach_id === userId ? ("coach" as const) : ("player" as const) };
}

export async function createTrialInvite(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const playerId = formData.get("playerId") as string;

  const permission = await canSendTrialInvite(supabase, user.id, playerId);
  if (!permission.allowed) return { error: permission.error };
  const scheduledAt = formData.get("scheduledAt") as string;
  const location = formData.get("location") as string;
  const notes = formData.get("notes") as string;

  const { data: invite, error } = await supabase
    .from("trial_invites")
    .insert({
      coach_id: user.id,
      player_id: playerId,
      scheduled_at: scheduledAt,
      location,
      notes,
      status: "pending",
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await supabase.from("notifications").insert({
    user_id: playerId,
    type: "trial_invite",
    title: "Trial invitation",
    body: `You've been invited to a trial on ${new Date(scheduledAt).toLocaleDateString()}`,
    metadata: { trial_id: invite.id },
  });

  revalidatePath("/trials");
  return { success: true, invite };
}

export async function updateTrialStatus(trialId: string, status: TrialStatus) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("trial_invites")
    .update({ status })
    .eq("id", trialId);
  if (error) return { error: error.message };
  revalidatePath("/trials");
  return { success: true };
}

export async function updateTrialStatusAction(trialId: string, status: TrialStatus) {
  return updateTrialStatus(trialId, status);
}

export async function setTrialInviteArchived(trialId: string, archived: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const participant = await getTrialParticipant(supabase, trialId, user.id);
  if ("error" in participant) return { error: participant.error };

  const at = archived ? new Date().toISOString() : null;
  const patch =
    participant.role === "coach"
      ? { coach_archived_at: at }
      : { player_archived_at: at };

  const { error } = await supabase.from("trial_invites").update(patch).eq("id", trialId);
  if (error) return { error: error.message };

  revalidatePath("/trials");
  return { success: true as const };
}

export async function deleteTrialInvite(trialId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const participant = await getTrialParticipant(supabase, trialId, user.id);
  if ("error" in participant) return { error: participant.error };

  const { error } = await supabase.from("trial_invites").delete().eq("id", trialId);
  if (error) return { error: error.message };

  revalidatePath("/trials");
  return { success: true as const };
}
