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
import type { PlayerProfile, PlayerWithDistance } from "@/types/database";

type PlayerDiscoverSectionsProps = {
  /** Hide duplicate nearby row when coach widget already shows nearby preview */
  hideNearbySection?: boolean;
  /** When provided, skips duplicate featured/trending fetches from the parent */
  featuredList?: PlayerProfile[];
  trendingList?: PlayerProfile[];
};

export function PlayerDiscoverSections({
  hideNearbySection = false,
  featuredList: featuredListProp,
  trendingList: trendingListProp,
}: PlayerDiscoverSectionsProps) {
  const skipFeaturedQuery = featuredListProp !== undefined;
  const skipTrendingQuery = trendingListProp !== undefined;

  const featured = useFeaturedPlayers({ enabled: !skipFeaturedQuery });
  const trending = useTrendingPlayers({ enabled: !skipTrendingQuery });
  const nearby = useNearbyPlayers(undefined, { enabled: !hideNearbySection });
  const active = useRecentlyActive();

  const featuredList = featuredListProp ?? featured.data?.data ?? [];
  const trendingList = trendingListProp ?? trending.data?.data ?? [];
  const nearbyList = nearby.data?.data ?? [];
  const activeList = active.data?.data ?? [];
  const showNearby = !hideNearbySection && nearbyList.length > 0;
  const hasAny =
    featuredList.length > 0 ||
    trendingList.length > 0 ||
    showNearby ||
    activeList.length > 0;
  const loading =
    (!skipFeaturedQuery && featured.isPending) ||
    (!skipTrendingQuery && trending.isPending) ||
    (!hideNearbySection && nearby.isPending) ||
    active.isPending;

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
    <div className="space-y-10 lg:space-y-10">
      {featuredList.length > 0 ? (
        <section className="rounded-2xl border border-white/[0.05] bg-gradient-to-b from-white/[0.03] to-transparent p-4 pb-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] lg:rounded-none lg:border-0 lg:bg-none lg:p-0 lg:pb-0 lg:shadow-none">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-brand)]/85 lg:text-xs lg:font-medium lg:tracking-wider lg:text-muted-foreground">
            Featured
          </h2>
          <div className="-mx-4 mt-3.5 flex gap-3.5 overflow-x-auto px-4 hide-scrollbar lg:mx-0 lg:mt-3 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:px-0 xl:grid-cols-4">
            {featuredList.map((p) => (
              <PlayerCard key={p.user_id} player={p} compact />
            ))}
          </div>
        </section>
      ) : null}
      {trendingList.length > 0 ? (
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/90 lg:text-xs lg:font-medium lg:tracking-wider lg:text-muted-foreground">
            Trending
          </h2>
          <div className="mt-3.5 grid gap-4 sm:grid-cols-2 lg:mt-3 lg:gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {trendingList.slice(0, 4).map((p) => (
              <PlayerCard key={p.user_id} player={p} />
            ))}
          </div>
        </section>
      ) : null}
      {showNearby ? (
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/90 lg:text-xs lg:font-medium lg:tracking-wider lg:text-muted-foreground">
            Nearby
          </h2>
          <div className="-mx-4 mt-3.5 flex gap-3.5 overflow-x-auto px-4 hide-scrollbar lg:mx-0 lg:mt-3 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:px-0 xl:grid-cols-4">
            {(nearbyList as PlayerWithDistance[]).map((p) => (
              <PlayerCard key={p.user_id} player={p} distanceKm={p.distanceKm} compact />
            ))}
          </div>
        </section>
      ) : null}
      {activeList.length > 0 ? (
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/90 lg:text-xs lg:font-medium lg:tracking-wider lg:text-muted-foreground">
            Recently active
          </h2>
          <div className="mt-3.5 grid gap-4 sm:grid-cols-2 lg:mt-3 lg:gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {activeList.slice(0, 4).map((p) => (
              <PlayerCard key={p.user_id} player={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
