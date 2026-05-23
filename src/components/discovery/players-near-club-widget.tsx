"use client";

import { ChevronRight } from "lucide-react";
import { PlayerCard } from "@/components/discovery/player-card";
import { useCoachSearchLocation } from "@/features/coaches/hooks";
import { useNearbyPlayers } from "@/features/players/hooks";
import { DEFAULT_RADIUS_KM } from "@/lib/geo/location-radius";
import { Skeleton } from "@/components/ui/skeleton";

type PlayersNearClubWidgetProps = {
  onSearchNearby?: () => void;
};

function formatOriginLabel(
  label: string | null,
  league: string | null | undefined
): string | null {
  if (!label) return null;
  if (label === "Your district" && league?.trim()) return league.trim();
  return label;
}

export function PlayersNearClubWidget({ onSearchNearby }: PlayersNearClubWidgetProps) {
  const coach = useCoachSearchLocation();
  const nearby = useNearbyPlayers(DEFAULT_RADIUS_KM);

  if (coach.isLoading || nearby.isLoading) {
    return (
      <section className="mb-8">
        <Skeleton className="h-4 w-32" />
        <div className="mt-3 flex gap-3 overflow-x-auto hide-scrollbar">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-52 w-44 shrink-0 rounded-2xl" />
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
    <section className="mb-8">
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
      <div className="-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 hide-scrollbar">
        {players.map((p) => (
          <PlayerCard key={p.user_id} player={p} distanceKm={p.distanceKm} compact />
        ))}
      </div>
    </section>
  );
}
