import { differenceInYears, isValid, parseISO, subYears, format } from "date-fns";

/** Inclusive min/max for player date of birth (full years as of today). */
export const MIN_PLAYER_AGE = 5;
export const MAX_PLAYER_AGE = 70;

export function calculateAge(dateOfBirth: Date, asOf = new Date()): number {
  return differenceInYears(asOf, dateOfBirth);
}

export function parseDateOfBirth(value: string): Date | null {
  const d = parseISO(value);
  return isValid(d) ? d : null;
}

export function isPlayerAgeInRange(dob: Date): boolean {
  const age = calculateAge(dob);
  return age >= MIN_PLAYER_AGE && age <= MAX_PLAYER_AGE;
}

export function dateOfBirthInputBounds(asOf = new Date()) {
  return {
    max: format(subYears(asOf, MIN_PLAYER_AGE), "yyyy-MM-dd"),
    min: format(subYears(asOf, MAX_PLAYER_AGE), "yyyy-MM-dd"),
  };
}

/** Fallback when only legacy `age` exists in the database. */
export function approximateDateOfBirthFromAge(age: number): string {
  const year = new Date().getFullYear() - age;
  return `${year}-06-15`;
}
