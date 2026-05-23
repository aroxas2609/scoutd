import type { CoachOnboardingInput, PlayerOnboardingInput } from "@/features/onboarding/schemas";
import { approximateDateOfBirthFromAge } from "@/lib/age";
import { isFootballPosition, type FootballPosition } from "@/lib/football/positions";
import { isAgeGroupCode, sortAgeGroupCodes } from "@/lib/football/age-groups";
import { parseStoredAustraliaLocation } from "@/lib/location/australia";
import type { CoachProfile, PlayerGender, PlayerProfile } from "@/types/database";

function normalizePlayerGender(value: string | null | undefined): PlayerGender | undefined {
  if (!value?.trim()) return undefined;
  const v = value.trim().toLowerCase();
  if (v === "female" || v === "f") return "female";
  if (v === "male" || v === "m") return "male";
  return undefined;
}

export function playerProfileToForm(player: PlayerProfile): PlayerOnboardingInput {
  const parsed = parseStoredAustraliaLocation(
    player.location_public ?? player.location,
    player.postcode
  );
  const suburb = player.suburb?.trim() || parsed.suburb;
  const state = parsed.state;
  const postcode = player.postcode?.trim() || parsed.postcode;

  const dateOfBirth =
    player.date_of_birth ??
    (player.age != null ? approximateDateOfBirthFromAge(player.age) : "");

  return {
    fullName: player.profiles?.full_name ?? "",
    dateOfBirth,
    locationSuburb: suburb,
    locationState: state,
    postcode,
    position: (isFootballPosition(player.position ?? "")
      ? player.position
      : "CM") as FootballPosition,
    secondaryPositions: player.secondary_positions ?? [],
    dominantFoot: player.dominant_foot ?? "right",
    heightCm: player.height_cm ?? undefined,
    currentClub: player.current_club ?? undefined,
    experienceLevel: player.experience_level ?? "amateur",
    bio: player.bio ?? undefined,
    availability: player.availability ?? "available",
    playingLevel: player.playing_level ?? undefined,
    willingToTravel: player.willing_to_travel ?? false,
    gender: normalizePlayerGender(player.gender) ?? undefined,
    associationId: player.association_id ?? undefined,
    contactEmail: player.contact_email ?? undefined,
    contactPhone: player.contact_phone ?? undefined,
  };
}

export function coachProfileToForm(coach: CoachProfile): CoachOnboardingInput {
  const clubName = coach.club_name ?? "";
  const storedName = coach.profiles?.full_name?.trim() ?? "";
  const coachName = storedName && storedName !== clubName ? storedName : "";

  const parsed = parseStoredAustraliaLocation(coach.location, coach.postcode);
  const suburb = coach.suburb?.trim() || parsed.suburb;
  const state = parsed.state;
  const postcode = coach.postcode?.trim() || parsed.postcode;

  return {
    coachName,
    clubName,
    league: coach.league ?? undefined,
    locationSuburb: suburb,
    locationState: state,
    postcode,
    address: coach.address ?? undefined,
    contactEmail: coach.contact_email ?? undefined,
    contactPhone: coach.contact_phone ?? undefined,
    contactPhoneAlt: coach.contact_phone_alt ?? undefined,
    ageGroups: sortAgeGroupCodes(
      (coach.age_groups ?? []).filter(isAgeGroupCode)
    ) as CoachOnboardingInput["ageGroups"],
    recruitingNeeds: coach.recruiting_needs ?? "",
    about: coach.about ?? undefined,
  };
}
