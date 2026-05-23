"use server";

import { createClient } from "@/lib/supabase/server";
import { computeCompletionScore } from "@/features/players/repository";
import type { CoachOnboardingInput, PlayerOnboardingInput } from "@/features/onboarding/schemas";

export async function updatePlayerProfile(data: PlayerOnboardingInput) {
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
    height_cm: data.heightCm ?? null,
    current_club: data.currentClub ?? null,
    experience_level: data.experienceLevel,
    bio: data.bio ?? null,
    availability: data.availability,
    playing_level: data.playingLevel ?? null,
    willing_to_travel: data.willingToTravel,
    gender: data.gender ?? null,
  };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: data.fullName })
    .eq("id", user.id);

  if (profileError) return { error: profileError.message };

  const { data: existing } = await supabase
    .from("player_profiles")
    .select("cover_url, social_links, has_highlights")
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = await supabase
    .from("player_profiles")
    .update({
      ...playerProfile,
      cover_url: existing?.cover_url ?? null,
      social_links: existing?.social_links ?? {},
      has_highlights: existing?.has_highlights ?? false,
      completion_score: computeCompletionScore({
        ...playerProfile,
        cover_url: existing?.cover_url,
        has_highlights: existing?.has_highlights,
      }),
    })
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  return { success: true as const };
}

export async function updateCoachProfile(data: CoachOnboardingInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("coach_profiles").upsert({
    user_id: user.id,
    club_name: data.clubName,
    league: data.league ?? null,
    location: data.location,
    address: data.address?.trim() || null,
    contact_email: data.contactEmail?.trim() || null,
    contact_phone: data.contactPhone?.trim() || null,
    contact_phone_alt: data.contactPhoneAlt?.trim() || null,
    age_groups: data.ageGroups,
    recruiting_needs: data.recruitingNeeds,
    about: data.about ?? null,
  });

  if (error) return { error: error.message };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: data.coachName })
    .eq("id", user.id);

  if (profileError) return { error: profileError.message };

  return { success: true as const };
}
