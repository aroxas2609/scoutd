"use client";

import { cn } from "@/lib/utils";

type DiscoverFilterChipsProps = {
  myDistrict: boolean;
  onMyDistrictChange: (value: boolean) => void;
  nearbyEnabled: boolean;
  onNearbyToggle: () => void;
  showNearby?: boolean;
};

export function DiscoverFilterChips({
  myDistrict,
  onMyDistrictChange,
  nearbyEnabled,
  onNearbyToggle,
  showNearby = true,
}: DiscoverFilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-0.5 lg:gap-2">
      <button
        type="button"
        onClick={() => onMyDistrictChange(!myDistrict)}
        className={cn(
          "shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
          "lg:px-3.5 lg:py-1.5 lg:text-xs lg:font-semibold",
          myDistrict
            ? "border-[var(--accent-brand)]/40 bg-[var(--accent-brand)]/12 text-foreground lg:border-[var(--accent-brand)]/50 lg:bg-[var(--accent-brand)]/15"
            : "border-white/[0.08] bg-white/[0.03] text-muted-foreground/80 hover:border-white/15 hover:text-foreground lg:border-white/10 lg:bg-white/[0.04] lg:text-muted-foreground lg:hover:border-white/20"
        )}
        aria-pressed={myDistrict}
      >
        My District
      </button>
      {showNearby ? (
        <button
          type="button"
          onClick={onNearbyToggle}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
            "lg:px-3.5 lg:py-1.5 lg:text-xs lg:font-semibold",
            nearbyEnabled
              ? "border-[var(--accent-brand)]/40 bg-[var(--accent-brand)]/12 text-foreground lg:border-[var(--accent-brand)]/50 lg:bg-[var(--accent-brand)]/15"
              : "border-white/[0.08] bg-white/[0.03] text-muted-foreground/80 hover:border-white/15 hover:text-foreground lg:border-white/10 lg:bg-white/[0.04] lg:text-muted-foreground lg:hover:border-white/20"
          )}
          aria-pressed={nearbyEnabled}
        >
          Nearby
        </button>
      ) : null}
    </div>
  );
}
