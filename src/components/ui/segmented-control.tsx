"use client";

import { cn } from "@/lib/utils";

type Segment<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "flex gap-1 rounded-xl border border-white/[0.08] bg-[var(--bg-graphite)] p-1",
        className
      )}
      role="tablist"
    >
      {segments.map((segment) => {
        const active = segment.value === value;
        return (
          <button
            key={segment.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={(e) => {
              e.preventDefault();
              onChange(segment.value);
            }}
            className={cn(
              "flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
              active
                ? "bg-[var(--accent-brand)] text-[var(--primary-foreground)] shadow-sm"
                : "text-muted-foreground hover:text-[var(--text-secondary)]"
            )}
          >
            {segment.label}
          </button>
        );
      })}
    </div>
  );
}
