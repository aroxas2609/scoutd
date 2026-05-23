"use client";

import { PlayerCard } from "@/components/discovery/player-card";
import {
  useFeaturedPlayers,
  useTrendingPlayers,
  useNearbyPlayers,
  useRecentlyActive,
} from "@/features/players/hooks";
import { EmptyStateCinematic } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/page-loader";
import { Users } from "lucide-react";

type PlayerDiscoverSectionsProps = {
  /** Hide duplicate nearby row when coach widget already shows nearby preview */
  hideNearbySection?: boolean;
};

export function PlayerDiscoverSections({ hideNearbySection = false }: PlayerDiscoverSectionsProps) {
  const featured = useFeaturedPlayers();
  const trending = useTrendingPlayers();
  const nearby = useNearbyPlayers();
  const active = useRecentlyActive();

  const featuredList = featured.data?.data ?? [];
  const trendingList = trending.data?.data ?? [];
  const nearbyList = nearby.data?.data ?? [];
  const activeList = active.data?.data ?? [];
  const showNearby = !hideNearbySection && nearbyList.length > 0;
  const hasAny =
    featuredList.length > 0 ||
    trendingList.length > 0 ||
    showNearby ||
    activeList.length > 0;
  const loading =
    featured.isPending || trending.isPending || nearby.isPending || active.isPending;

  if (loading) return <PageLoader />;

  if (!hasAny) {
    return (
      <EmptyStateCinematic
        icon={<Users className="h-6 w-6" />}
        title="No players yet"
        description="When players join Scoutd, they'll show up here. Use search above to find profiles."
      />
    );
  }

  return (
    <div className="space-y-8">
      {featuredList.length > 0 ? (
        <section>
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Featured
          </h2>
          <div className="-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 hide-scrollbar">
            {featuredList.map((p) => (
              <PlayerCard key={p.user_id} player={p} compact />
            ))}
          </div>
        </section>
      ) : null}
      {trendingList.length > 0 ? (
        <section>
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Trending
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {trendingList.slice(0, 4).map((p) => (
              <PlayerCard key={p.user_id} player={p} />
            ))}
          </div>
        </section>
      ) : null}
      {showNearby ? (
        <section>
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Nearby
          </h2>
          <div className="-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 hide-scrollbar">
            {nearbyList.map((p) => (
              <PlayerCard key={p.user_id} player={p} distanceKm={p.distanceKm} compact />
            ))}
          </div>
        </section>
      ) : null}
      {activeList.length > 0 ? (
        <section>
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Recently active
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {activeList.slice(0, 4).map((p) => (
              <PlayerCard key={p.user_id} player={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
