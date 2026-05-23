"use client";

import { MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RADIUS_OPTIONS_KM, type RadiusKm } from "@/lib/geo/location-radius";
import { cn } from "@/lib/utils";

type NearbyRadiusControlsProps = {
  radiusKm: RadiusKm;
  onRadiusChange: (km: RadiusKm) => void;
  sortByNearest: boolean;
  onSortByNearestChange: (value: boolean) => void;
  searchLabel?: string | null;
};

export function NearbyRadiusControls({
  radiusKm,
  onRadiusChange,
  sortByNearest,
  onSortByNearestChange,
  searchLabel,
}: NearbyRadiusControlsProps) {
  return (
    <div className="space-y-2.5 border-t border-white/[0.06] px-4 py-2.5">
      <div className="flex items-center justify-between gap-3">
        {searchLabel ? (
          <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              From <span className="font-medium text-foreground/90">{searchLabel}</span>
            </span>
          </p>
        ) : (
          <span className="text-xs text-muted-foreground">Radius search</span>
        )}
        <div className="flex shrink-0 items-center gap-2">
          <Label htmlFor="sort-nearest" className="text-xs text-muted-foreground">
            Nearest
          </Label>
          <Switch
            id="sort-nearest"
            checked={sortByNearest}
            onCheckedChange={onSortByNearestChange}
          />
        </div>
      </div>
      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
        {RADIUS_OPTIONS_KM.map((km) => (
          <button
            key={km}
            type="button"
            onClick={() => onRadiusChange(km)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
              radiusKm === km
                ? "bg-[var(--accent-brand)]/20 text-foreground ring-1 ring-[var(--accent-brand)]/40"
                : "bg-white/[0.06] text-muted-foreground hover:bg-white/10 hover:text-foreground"
            )}
            aria-pressed={radiusKm === km}
          >
            {km} km
          </button>
        ))}
      </div>
    </div>
  );
}
