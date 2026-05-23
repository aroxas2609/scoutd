import type { PlayerOnboardingInput } from "@/features/onboarding/schemas";
import { calculateAge, parseDateOfBirth } from "@/lib/age";
import { formatAustraliaLocation } from "@/lib/location/australia";

export function buildPlayerProfileRow(
  data: PlayerOnboardingInput,
  userId: string
) {
  const dob = parseDateOfBirth(data.dateOfBirth)!;
  const age = calculateAge(dob);
  const locationLabel = formatAustraliaLocation(
    data.locationSuburb,
    data.locationState,
    data.postcode
  );

  return {
    user_id: userId,
    age,
    date_of_birth: data.dateOfBirth,
    postcode: data.postcode,
    location: locationLabel,
    location_public: locationLabel,
    position: data.position,
    secondary_positions: data.secondaryPositions ?? [],
    dominant_foot: data.dominantFoot,
    height_cm: data.heightCm ?? null,
    current_club: data.currentClub?.trim() || null,
    experience_level: data.experienceLevel,
    bio: data.bio?.trim() || null,
    availability: data.availability,
    playing_level: data.playingLevel ?? null,
    willing_to_travel: data.willingToTravel,
    gender: data.gender ?? null,
  };
}
