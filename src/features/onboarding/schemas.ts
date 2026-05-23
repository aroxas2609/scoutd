import { z } from "zod";

export const playerOnboardingSchema = z.object({
  fullName: z.string().min(2),
  age: z.number().min(14).max(50),
  location: z.string().min(2),
  position: z.string().min(1),
  secondaryPositions: z.array(z.string()).optional(),
  dominantFoot: z.enum(["left", "right", "both"]),
  heightCm: z.number().optional(),
  currentClub: z.string().optional(),
  experienceLevel: z.enum(["academy", "semi_pro", "professional", "amateur"]),
  bio: z.string().max(500).optional(),
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
  coachName: z.string().min(2, "Enter your name as coaches see it in messages"),
  clubName: z.string().min(2),
  league: z.string().optional(),
  location: z.string().min(2),
  address: z.string().optional(),
  contactEmail: optionalEmail,
  contactPhone: z.string().optional(),
  contactPhoneAlt: z.string().optional(),
  ageGroups: z.array(z.string()).min(1),
  recruitingNeeds: z.string().min(10),
  about: z.string().max(1000).optional(),
});

export type PlayerOnboardingInput = z.infer<typeof playerOnboardingSchema>;
export type CoachOnboardingInput = z.infer<typeof coachOnboardingSchema>;
