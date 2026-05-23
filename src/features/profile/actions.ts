"use server";

import { createClient } from "@/lib/supabase/server";
import { resolveAssociationIdByName } from "@/features/associations/repository";
import { computeCompletionScore } from "@/features/players/repository";
import { buildCoachLocationFields } from "@/features/profile/coach-payload";
import { buildPlayerProfileRow } from "@/features/profile/player-payload";
import type { CoachOnboardingInput, PlayerOnboardingInput } from "@/features/onboarding/schemas";

export async function updatePlayerProfile(data: PlayerOnboardingInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const playerProfile = buildPlayerProfileRow(data, user.id);

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: data.fullName })
    .eq("id", user.id);

  if (profileError) return { error: profileError.message };

  const { data: existing } = await supabase
    .from("player_profiles")
    .select("social_links, has_highlights")
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = await supabase
    .from("player_profiles")
    .update({
      ...playerProfile,
      social_links: existing?.social_links ?? {},
      has_highlights: existing?.has_highlights ?? false,
      completion_score: computeCompletionScore({
        ...playerProfile,
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

  const { location, suburb, postcode } = buildCoachLocationFields(data);
  const league = data.league?.trim() || null;
  const { id: association_id } = await resolveAssociationIdByName(supabase, league);

  const { error } = await supabase.from("coach_profiles").upsert({
    user_id: user.id,
    club_name: data.clubName,
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
