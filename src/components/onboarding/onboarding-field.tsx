"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function OnboardingField({
  label,
  labelExtra,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  labelExtra?: React.ReactNode;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        {labelExtra}
      </div>
      {children}
      {hint && !error ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
