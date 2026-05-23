import type { CoachOnboardingInput, PlayerOnboardingInput } from "@/features/onboarding/schemas";
import type { CoachProfile, PlayerProfile } from "@/types/database";

export function playerProfileToForm(player: PlayerProfile): PlayerOnboardingInput {
  return {
    fullName: player.profiles?.full_name ?? "",
    age: player.age ?? 18,
    location: player.location_public ?? player.location ?? "",
    position: player.position ?? "",
    secondaryPositions: player.secondary_positions ?? [],
    dominantFoot: player.dominant_foot ?? "right",
    heightCm: player.height_cm ?? undefined,
    currentClub: player.current_club ?? undefined,
    experienceLevel: player.experience_level ?? "amateur",
    bio: player.bio ?? undefined,
    availability: player.availability ?? "available",
    playingLevel: player.playing_level ?? undefined,
    willingToTravel: player.willing_to_travel ?? false,
    gender: player.gender ?? undefined,
  };
}

export function coachProfileToForm(coach: CoachProfile): CoachOnboardingInput {
  const clubName = coach.club_name ?? "";
  const storedName = coach.profiles?.full_name?.trim() ?? "";
  const coachName = storedName && storedName !== clubName ? storedName : "";

  return {
    coachName,
    clubName,
    league: coach.league ?? undefined,
    location: coach.location ?? "",
    address: coach.address ?? undefined,
    contactEmail: coach.contact_email ?? undefined,
    contactPhone: coach.contact_phone ?? undefined,
    contactPhoneAlt: coach.contact_phone_alt ?? undefined,
    ageGroups: coach.age_groups ?? [],
    recruitingNeeds: coach.recruiting_needs ?? "",
    about: coach.about ?? undefined,
  };
}
