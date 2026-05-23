"use client";

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
    <Input
      type="date"
      value={value}
      min={bounds.min}
      max={bounds.max}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      className={cn("mt-0 bg-white/5", error && "border-red-400/50", className)}
      aria-describedby={age != null ? "dob-age-hint" : undefined}
    />
  );
}

export function formatAgeHint(dateOfBirth: string): string | undefined {
  const dob = dateOfBirth ? parseDateOfBirth(dateOfBirth) : null;
  if (!dob) return undefined;
  return `Age ${calculateAge(dob)}`;
}
