"use client";

import { Calendar } from "lucide-react";
import { calculateAge, dateOfBirthInputBounds, parseDateOfBirth } from "@/lib/age";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type DateOfBirthFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: boolean;
  className?: string;
};

export function DateOfBirthField({
  value,
  onChange,
  onBlur,
  error,
  className,
}: DateOfBirthFieldProps) {
  const bounds = dateOfBirthInputBounds();
  const dob = value ? parseDateOfBirth(value) : null;
  const age = dob ? calculateAge(dob) : null;

  return (
    <div className={cn("relative w-full min-w-0 max-w-full", className)}>
      {!value ? (
        <span
          className="pointer-events-none absolute left-3.5 top-1/2 z-[1] -translate-y-1/2 text-base text-muted-foreground md:text-sm"
          aria-hidden
        >
          dd/mm/yyyy
        </span>
      ) : null}
      <Input
        type="date"
        value={value}
        min={bounds.min}
        max={bounds.max}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={cn(
          "mt-0 box-border w-full max-w-full min-w-0 bg-white/5 pr-11",
          "text-base md:text-sm",
          "[&::-webkit-date-and-time-value]:min-w-0 [&::-webkit-date-and-time-value]:text-left",
          "[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0",
          "[&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-11",
          "[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0",
          // Hide native empty-state "dd/mm/yyyy" — we render a single custom placeholder below.
          !value &&
            "[&::-webkit-datetime-edit]:opacity-0 [&::-webkit-datetime-edit-fields-wrapper]:opacity-0",
          error && "border-red-400/50"
        )}
        style={{ WebkitAppearance: "none", appearance: "none" } as React.CSSProperties}
        aria-describedby={age != null ? "dob-age-hint" : undefined}
      />
      <Calendar
        className="pointer-events-none absolute top-1/2 right-3.5 z-[1] h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  );
}

export function formatAgeHint(dateOfBirth: string): string | undefined {
  const dob = dateOfBirth ? parseDateOfBirth(dateOfBirth) : null;
  if (!dob) return undefined;
  return `Age ${calculateAge(dob)}`;
}
