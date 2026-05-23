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
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-0.5">
      <button
        type="button"
        onClick={() => onMyDistrictChange(!myDistrict)}
        className={cn(
          "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
          myDistrict
            ? "border-[var(--accent-brand)]/50 bg-[var(--accent-brand)]/15 text-foreground"
            : "border-white/10 bg-white/[0.04] text-muted-foreground hover:border-white/20 hover:text-foreground"
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
            "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
            nearbyEnabled
              ? "border-[var(--accent-brand)]/50 bg-[var(--accent-brand)]/15 text-foreground"
              : "border-white/10 bg-white/[0.04] text-muted-foreground hover:border-white/20 hover:text-foreground"
          )}
          aria-pressed={nearbyEnabled}
        >
          Nearby
        </button>
      ) : null}
    </div>
  );
}
