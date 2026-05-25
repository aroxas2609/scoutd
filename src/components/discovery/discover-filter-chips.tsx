"use client";

import { cn } from "@/lib/utils";

type DiscoverFilterChipsProps = {
  myDistrict: boolean;
  onMyDistrictChange: (value: boolean) => void;
  nearbyEnabled: boolean;
  onNearbyToggle: () => void;
  catalogEnabled?: boolean;
  onCatalogToggle?: () => void;
  catalogLabel?: string;
  showNearby?: boolean;
  showMyDistrict?: boolean;
};

export function DiscoverFilterChips({
  myDistrict,
  onMyDistrictChange,
  nearbyEnabled,
  onNearbyToggle,
  catalogEnabled = false,
  onCatalogToggle,
  catalogLabel = "All players",
  showNearby = true,
  showMyDistrict = true,
}: DiscoverFilterChipsProps) {
  const chipClass = (active: boolean) =>
    cn(
      "shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
      "lg:px-3.5 lg:py-1.5 lg:text-xs lg:font-semibold",
      active
        ? "border-[var(--accent-brand)]/40 bg-[var(--accent-brand)]/12 text-foreground lg:border-[var(--accent-brand)]/50 lg:bg-[var(--accent-brand)]/15"
        : "border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:border-white/15 hover:text-foreground lg:border-white/10 lg:bg-white/[0.04] lg:hover:border-white/20"
    );

  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-0.5 lg:gap-2">
      {showMyDistrict ? (
        <button
          type="button"
          onClick={() => onMyDistrictChange(!myDistrict)}
          className={chipClass(myDistrict)}
          aria-pressed={myDistrict}
        >
          My District
        </button>
      ) : null}
      {showNearby ? (
        <button
          type="button"
          onClick={onNearbyToggle}
          className={chipClass(nearbyEnabled)}
          aria-pressed={nearbyEnabled}
        >
          Nearby
        </button>
      ) : null}
      {onCatalogToggle ? (
        <button
          type="button"
          onClick={onCatalogToggle}
          className={chipClass(catalogEnabled)}
          aria-pressed={catalogEnabled}
        >
          {catalogLabel}
        </button>
      ) : null}
    </div>
  );
}
