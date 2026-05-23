import { addDays, format } from "date-fns";

/** Combine HTML date + time (local) into ISO for Supabase timestamptz. */
export function combineLocalDateAndTime(date: string, time: string): string | null {
  if (!date || !time) return null;
  const parsed = new Date(`${date}T${time}:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export function defaultTrialDate(): string {
  return format(addDays(new Date(), 7), "yyyy-MM-dd");
}

export function defaultTrialTime(): string {
  return "10:00";
}

export function trialDateInputMin(): string {
  return format(new Date(), "yyyy-MM-dd");
}
