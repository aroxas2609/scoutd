"use client";

import { useDeferredReady } from "@/lib/use-deferred-ready";
import { PlayerCard } from "@/components/discovery/player-card";
import {
  useFeaturedPlayers,
  useTrendingPlayers,
  useNearbyPlayers,
  useRecentlyActive,
  type NearbyPlayersOptions,
  type PlayerListOptions,
} from "@/features/players/hooks";
import { EmptyStateCinematic } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import type { PlayerProfile, PlayerWithDistance } from "@/types/database";

type PlayerDiscoverSectionsProps = {
  /** Hide duplicate nearby row when coach widget already shows nearby preview */
  hideNearbySection?: boolean;
  /** When provided, skips duplicate featured/trending fetches from the parent */
  featuredList?: PlayerProfile[];
  trendingList?: PlayerProfile[];
  listOptions?: PlayerListOptions;
  nearbyOptions?: NearbyPlayersOptions;
};

function SectionSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="-mx-4 flex gap-3.5 overflow-hidden px-4 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:px-0 xl:grid-cols-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5] w-[11.5rem] shrink-0 rounded-2xl lg:w-full" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 2 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
      ))}
    </div>
  );
}

export function PlayerDiscoverSections({
  hideNearbySection = false,
  featuredList: featuredListProp,
  trendingList: trendingListProp,
  listOptions,
  nearbyOptions,
}: PlayerDiscoverSectionsProps) {
  const skipFeaturedQuery = featuredListProp !== undefined;
  const skipTrendingQuery = trendingListProp !== undefined;

  const featured = useFeaturedPlayers({
    enabled: !skipFeaturedQuery,
    ...listOptions,
  });
  const trending = useTrendingPlayers({
    enabled: !skipTrendingQuery,
    ...listOptions,
  });

  const primaryReady =
    (skipFeaturedQuery || featured.isSuccess || featured.isError) &&
    (skipTrendingQuery || trending.isSuccess || trending.isError);

  const deferSecondary = useDeferredReady(primaryReady);

  const nearby = useNearbyPlayers(undefined, {
    enabled: !hideNearbySection && deferSecondary,
    ...nearbyOptions,
  });
  const active = useRecentlyActive({
    ...listOptions,
    enabled: deferSecondary && (listOptions?.enabled ?? true),
  });

  const featuredList = featuredListProp ?? featured.data?.data ?? [];
  const trendingList = trendingListProp ?? trending.data?.data ?? [];
  const nearbyList = nearby.data?.data ?? [];
  const activeList = active.data?.data ?? [];
  const showNearby = !hideNearbySection && nearbyList.length > 0;

  const showEmpty =
    primaryReady &&
    deferSecondary &&
    (!hideNearbySection ? nearby.isSuccess || nearby.isError : true) &&
    (active.isSuccess || active.isError) &&
    featuredList.length === 0 &&
    trendingList.length === 0 &&
    !showNearby &&
    activeList.length === 0;

  if (showEmpty) {
    return (
      <EmptyStateCinematic
        icon={<Users className="h-6 w-6" />}
        title="No players yet"
        description="When players join Scoutd, they'll show up here. Try search above or adjust filters."
      />
    );
  }

  return (
    <div className="space-y-10 lg:space-y-10">
      {!skipFeaturedQuery && (featured.isPending || featuredList.length > 0) ? (
        <section className="rounded-2xl border border-white/[0.05] bg-gradient-to-b from-white/[0.03] to-transparent p-4 pb-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] lg:rounded-none lg:border-0 lg:bg-none lg:p-0 lg:pb-0 lg:shadow-none">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-brand)]/85 lg:text-xs lg:font-medium lg:tracking-wider lg:text-muted-foreground">
            Featured
          </h2>
          <div className="-mx-4 mt-3.5 flex gap-3.5 overflow-x-auto px-4 hide-scrollbar lg:mx-0 lg:mt-3 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:px-0 xl:grid-cols-4">
            {featured.isPending ? (
              <SectionSkeleton compact />
            ) : (
              featuredList.map((p) => <PlayerCard key={p.user_id} player={p} compact />)
            )}
          </div>
        </section>
      ) : null}

      {!skipTrendingQuery && (trending.isPending || trendingList.length > 0) ? (
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary lg:text-xs lg:font-medium lg:tracking-wider lg:text-muted-foreground">
            Trending
          </h2>
          <div className="mt-3.5">
            {trending.isPending ? (
              <SectionSkeleton />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:mt-0 lg:gap-3 lg:grid-cols-2 xl:grid-cols-3">
                {trendingList.slice(0, 4).map((p) => (
                  <PlayerCard key={p.user_id} player={p} />
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}

      {!hideNearbySection &&
      (nearby.isPending || nearby.isFetching || showNearby) ? (
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary lg:text-xs lg:font-medium lg:tracking-wider lg:text-muted-foreground">
            Nearby
          </h2>
          <div className="-mx-4 mt-3.5 flex gap-3.5 overflow-x-auto px-4 hide-scrollbar lg:mx-0 lg:mt-3 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:px-0 xl:grid-cols-4">
            {nearby.isPending || nearby.isFetching ? (
              <SectionSkeleton compact />
            ) : (
              (nearbyList as PlayerWithDistance[]).map((p) => (
                <PlayerCard key={p.user_id} player={p} distanceKm={p.distanceKm} compact />
              ))
            )}
          </div>
        </section>
      ) : null}

      {active.isPending || activeList.length > 0 ? (
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary lg:text-xs lg:font-medium lg:tracking-wider lg:text-muted-foreground">
            Recently active
          </h2>
          <div className="mt-3.5">
            {active.isPending ? (
              <SectionSkeleton />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:mt-0 lg:gap-3 lg:grid-cols-2 xl:grid-cols-3">
                {activeList.slice(0, 4).map((p) => (
                  <PlayerCard key={p.user_id} player={p} />
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
