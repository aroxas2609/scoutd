import type { CoachOnboardingInput, PlayerOnboardingInput } from "./schemas";

export const PLAYER_ONBOARDING_STEP_FIELDS: Record<
  number,
  (keyof PlayerOnboardingInput)[]
> = {
  0: ["fullName", "dateOfBirth", "locationSuburb", "locationState", "postcode"],
  1: ["position", "dominantFoot"],
  2: ["experienceLevel"],
  3: ["bio"],
  4: ["willingToTravel", "availability", "contactEmail", "contactPhone"],
};

export const COACH_ONBOARDING_STEP_FIELDS: Record<
  number,
  (keyof CoachOnboardingInput)[]
> = {
  0: [
    "coachName",
    "clubName",
    "locationSuburb",
    "locationState",
    "postcode",
    "ageGroups",
    "contactEmail",
    "contactPhone",
    "contactPhoneAlt",
    "league",
    "address",
  ],
  1: ["recruitingNeeds", "about"],
};
