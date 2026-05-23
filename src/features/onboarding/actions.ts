"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeCompletionScore } from "@/features/players/repository";
import type { CoachOnboardingInput, PlayerOnboardingInput } from "./schemas";

export async function completePlayerOnboarding(data: PlayerOnboardingInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const playerProfile = {
    user_id: user.id,
    age: data.age,
    location: data.location,
    location_public: data.location,
    position: data.position,
    secondary_positions: data.secondaryPositions ?? [],
    dominant_foot: data.dominantFoot,
    height_cm: data.heightCm,
    current_club: data.currentClub,
    experience_level: data.experienceLevel,
    bio: data.bio,
    availability: data.availability,
    playing_level: data.playingLevel,
    willing_to_travel: data.willingToTravel,
    gender: data.gender,
    completion_score: 0,
  };

  playerProfile.completion_score = computeCompletionScore(playerProfile);

  await supabase.from("profiles").update({
    full_name: data.fullName,
    onboarding_complete: true,
  }).eq("id", user.id);

  const { error } = await supabase.from("player_profiles").upsert(playerProfile);
  if (error) return { error: error.message };
  redirect("/discover");
}

export async function completeCoachOnboarding(data: CoachOnboardingInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("coach_profiles").upsert({
    user_id: user.id,
    club_name: data.clubName,
    league: data.league,
    location: data.location,
    address: data.address?.trim() || null,
    contact_email: data.contactEmail?.trim() || null,
    contact_phone: data.contactPhone?.trim() || null,
    contact_phone_alt: data.contactPhoneAlt?.trim() || null,
    age_groups: data.ageGroups,
    recruiting_needs: data.recruitingNeeds,
    about: data.about,
  });

  if (error) return { error: error.message };

  await supabase
    .from("profiles")
    .update({ full_name: data.coachName, onboarding_complete: true })
    .eq("id", user.id);
  redirect("/discover");
}
