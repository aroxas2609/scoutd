"use client";

import { ChevronRight } from "lucide-react";
import { PlayerCard } from "@/components/discovery/player-card";
import { useCoachSearchLocation } from "@/features/coaches/hooks";
import { useNearbyPlayers } from "@/features/players/hooks";
import { DEFAULT_RADIUS_KM } from "@/lib/geo/location-radius";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type PlayersNearClubWidgetProps = {
  onSearchNearby?: () => void;
  layout?: "carousel" | "grid";
};

function formatOriginLabel(
  label: string | null,
  league: string | null | undefined
): string | null {
  if (!label) return null;
  if (label === "Your district" && league?.trim()) return league.trim();
  return label;
}

export function PlayersNearClubWidget({
  onSearchNearby,
  layout = "carousel",
}: PlayersNearClubWidgetProps) {
  const coach = useCoachSearchLocation();
  const nearby = useNearbyPlayers(DEFAULT_RADIUS_KM);
  const isGrid = layout === "grid";

  if (coach.isLoading || nearby.isLoading) {
    return (
      <section className={cn("mb-8", isGrid && "lg:mb-0")}>
        <Skeleton className="h-4 w-32" />
        <div
          className={cn(
            "mt-3 flex gap-3 overflow-x-auto hide-scrollbar",
            isGrid && "lg:grid lg:grid-cols-2 lg:gap-4 lg:overflow-visible xl:grid-cols-3"
          )}
        >
          {Array.from({ length: isGrid ? 3 : 2 }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn(
                "h-52 shrink-0 rounded-2xl",
                isGrid ? "w-full lg:h-64" : "w-44"
              )}
            />
          ))}
        </div>
      </section>
    );
  }

  if (!coach.canSearchNearby) return null;

  const players = (nearby.data?.data ?? []).slice(0, 6);
  const origin = formatOriginLabel(coach.label, coach.coachDistrict?.league);

  if (players.length === 0) return null;

  return (
    <section className={cn("mb-8", isGrid && "mb-0")}>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Near your club
          </h2>
          {origin ? (
            <p className="mt-1 truncate text-sm text-foreground/80">
              Within {DEFAULT_RADIUS_KM} km · {origin}
            </p>
          ) : null}
        </div>
        {onSearchNearby ? (
          <button
            type="button"
            onClick={onSearchNearby}
            className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-[var(--accent-brand)]"
          >
            View all
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
      <div
        className={cn(
          "-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 hide-scrollbar",
          isGrid &&
            "mx-0 grid grid-cols-1 gap-4 overflow-visible px-0 sm:grid-cols-2 xl:grid-cols-3"
        )}
      >
        {players.map((p) => (
          <PlayerCard
            key={p.user_id}
            player={p}
            distanceKm={p.distanceKm}
            compact={!isGrid}
          />
        ))}
      </div>
    </section>
  );
}
