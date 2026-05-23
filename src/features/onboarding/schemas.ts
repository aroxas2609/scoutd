import { z } from "zod";
import { isPlayerAgeInRange, parseDateOfBirth } from "@/lib/age";
import { AGE_GROUP_CODES } from "@/lib/football/age-groups";
import { isMetroAssociation } from "@/lib/football/metro-nsw-associations";
import { FOOTBALL_POSITION_VALUES } from "@/lib/football/positions";

export const playerOnboardingSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  dateOfBirth: z
    .string()
    .min(1, "Select your date of birth")
    .refine((v) => parseDateOfBirth(v) !== null, "Select a valid date")
    .refine((v) => {
      const dob = parseDateOfBirth(v);
      return dob ? isPlayerAgeInRange(dob) : false;
    }, "You must be between 14 and 50 years old"),
  locationSuburb: z.string().trim().min(1, "Select your suburb"),
  locationState: z.string().trim().min(1, "Select your suburb"),
  postcode: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Select a suburb from the list"),
  position: z.enum(FOOTBALL_POSITION_VALUES, {
    error: "Select your primary position",
  }),
  secondaryPositions: z.array(z.string()).optional(),
  dominantFoot: z.enum(["left", "right", "both"], {
    error: "Select your dominant foot",
  }),
  heightCm: z.number().positive("Enter a valid height").optional(),
  currentClub: z.string().trim().optional(),
  experienceLevel: z.enum(["academy", "semi_pro", "professional", "amateur"], {
    error: "Select your experience level",
  }),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
  availability: z.enum(["available", "open_to_offers", "not_available"]),
  playingLevel: z.string().optional(),
  willingToTravel: z.boolean(),
  gender: z.string().optional(),
});

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
    message: "Enter a valid email address",
  });

export const coachOnboardingSchema = z.object({
  coachName: z.string().trim().min(2, "Enter your name as coaches see it in messages"),
  clubName: z.string().trim().min(2, "Enter your club name"),
  league: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || isMetroAssociation(v), "Select an association from the list"),
  locationSuburb: z.string().trim().min(1, "Select your suburb"),
  locationState: z.string().trim().min(1, "Select your suburb"),
  postcode: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Select a suburb from the list"),
  address: z.string().trim().optional(),
  contactEmail: optionalEmail,
  contactPhone: z.string().trim().optional(),
  contactPhoneAlt: z.string().trim().optional(),
  ageGroups: z
    .array(z.enum(AGE_GROUP_CODES))
    .min(1, "Select at least one age group"),
  recruitingNeeds: z
    .string()
    .trim()
    .min(10, "Describe your recruiting needs (at least 10 characters)"),
  about: z.string().max(1000, "About must be 1000 characters or less").optional(),
});

export type PlayerOnboardingInput = z.infer<typeof playerOnboardingSchema>;
export type CoachOnboardingInput = z.infer<typeof coachOnboardingSchema>;
