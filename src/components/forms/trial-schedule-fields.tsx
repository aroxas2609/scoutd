"use client";

import { Calendar, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProfileFormField } from "@/components/profile/profile-form-primitives";
import { trialDateInputMin } from "@/lib/trials/schedule";
import { cn } from "@/lib/utils";

const pickerInputClass =
  "h-11 rounded-xl border-white/10 bg-[var(--bg-deep)] pl-10 [color-scheme:dark]";

type TrialScheduleFieldsProps = {
  date: string;
  time: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  dateError?: string;
  timeError?: string;
};

export function TrialScheduleFields({
  date,
  time,
  onDateChange,
  onTimeChange,
  dateError,
  timeError,
}: TrialScheduleFieldsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <ProfileFormField label="Date" error={dateError}>
        <div className="relative">
          <Calendar
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="date"
            value={date}
            min={trialDateInputMin()}
            onChange={(e) => onDateChange(e.target.value)}
            required
            className={cn(pickerInputClass, dateError && "border-red-400/50")}
          />
        </div>
      </ProfileFormField>
      <ProfileFormField label="Time" error={timeError}>
        <div className="relative">
          <Clock
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="time"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            required
            className={cn(pickerInputClass, timeError && "border-red-400/50")}
          />
        </div>
      </ProfileFormField>
    </div>
  );
}
