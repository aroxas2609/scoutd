"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { computeCompletionScore } from "@/features/players/repository";
import { resolveAssociationIdByName } from "@/features/associations/repository";
import { buildCoachLocationFields } from "@/features/profile/coach-payload";
import { buildPlayerProfileRow } from "@/features/profile/player-payload";
import type { CoachOnboardingInput, PlayerOnboardingInput } from "./schemas";

export async function completePlayerOnboarding(data: PlayerOnboardingInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "player") {
    return { error: "Complete player setup from the player onboarding path." };
  }

  const playerProfile = {
    ...buildPlayerProfileRow(data, user.id),
    completion_score: 0,
  };

  playerProfile.completion_score = computeCompletionScore(playerProfile);

  const { error: playerError } = await supabase.from("player_profiles").upsert(playerProfile);
  if (playerError) return { error: playerError.message };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: data.fullName.trim(),
      onboarding_complete: true,
    })
    .eq("id", user.id);

  if (profileError) return { error: profileError.message };

  revalidatePath("/profile");
  revalidatePath("/search");
  return { success: true as const };
}

export async function completeCoachOnboarding(data: CoachOnboardingInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "coach") {
    return { error: "Complete club setup from the coach onboarding path." };
  }

  const { location, suburb, postcode } = buildCoachLocationFields(data);
  const league = data.league?.trim() || null;
  const { id: association_id } = await resolveAssociationIdByName(supabase, league);

  const { error: coachError } = await supabase.from("coach_profiles").upsert({
    user_id: user.id,
    club_name: data.clubName?.trim() || null,
    league,
    association_id,
    location,
    suburb,
    postcode,
    address: data.address?.trim() || null,
    contact_email: data.contactEmail?.trim() || null,
    contact_phone: data.contactPhone?.trim() || null,
    contact_phone_alt: data.contactPhoneAlt?.trim() || null,
    age_groups: data.ageGroups,
    recruiting_needs: data.recruitingNeeds.trim(),
    about: data.about?.trim() || null,
  });

  if (coachError) return { error: coachError.message };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: data.coachName.trim(),
      onboarding_complete: true,
    })
    .eq("id", user.id);

  if (profileError) return { error: profileError.message };

  revalidatePath("/profile");
  revalidatePath("/search");
  return { success: true as const };
}
