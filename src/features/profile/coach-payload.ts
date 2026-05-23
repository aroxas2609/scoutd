import type { CoachOnboardingInput } from "@/features/onboarding/schemas";
import { formatAustraliaLocation } from "@/lib/location/australia";

export function buildCoachLocationFields(data: CoachOnboardingInput) {
  const location = formatAustraliaLocation(
    data.locationSuburb,
    data.locationState,
    data.postcode
  );
  return {
    location,
    postcode: data.postcode,
  };
}
