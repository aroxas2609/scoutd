"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { SwipeDeck } from "@/components/discovery/swipe-deck";
import { PlayerCard } from "@/components/discovery/player-card";
import {
  useFeaturedPlayers,
  useTrendingPlayers,
  useNearbyPlayers,
  useRecentlyActive,
} from "@/features/players/hooks";
import { EmptyStateCinematic } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/page-loader";
import { Layers, Users } from "lucide-react";

export function PlayerDiscoverView() {
  const [swipeMode, setSwipeMode] = useState(false);
  const featured = useFeaturedPlayers();
  const trending = useTrendingPlayers();
  const nearby = useNearbyPlayers();
  const active = useRecentlyActive();

  const loading =
    featured.isPending || trending.isPending || nearby.isPending || active.isPending;

  const featuredList = featured.data?.data ?? [];
  const trendingList = trending.data?.data ?? [];
  const nearbyList = nearby.data?.data ?? [];
  const activeList = active.data?.data ?? [];
  const hasAny =
    featuredList.length > 0 ||
    trendingList.length > 0 ||
    nearbyList.length > 0 ||
    activeList.length > 0;

  return (
    <>
      <AppHeader
        title="Discover"
        subtitle={swipeMode ? "Swipe to scout" : "Featured & trending players"}
      />
      <div className="px-4">
        {hasAny ? (
          <button
            type="button"
            onClick={() => setSwipeMode(!swipeMode)}
            className="fixed bottom-28 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-zinc-900 shadow-lg"
          >
            <Layers className="h-6 w-6" />
          </button>
        ) : null}

        {loading ? (
          <PageLoader />
        ) : !hasAny ? (
          <EmptyStateCinematic
            icon={<Users className="h-6 w-6" />}
            title="No players yet"
            description="When players join Scoutd, they'll show up here. Try Search to find profiles."
          />
        ) : swipeMode ? (
          <SwipeDeck players={featuredList.length ? featuredList : trendingList} />
        ) : (
          <div className="space-y-10 pb-8">
            {featuredList.length > 0 ? (
              <section>
                <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Featured
                </h2>
                <div className="mt-4 flex gap-4 overflow-x-auto hide-scrollbar">
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
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {trendingList.slice(0, 4).map((p) => (
                    <PlayerCard key={p.user_id} player={p} />
                  ))}
                </div>
              </section>
            ) : null}
            {nearbyList.length > 0 ? (
              <section>
                <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Nearby
                </h2>
                <div className="mt-4 flex gap-4 overflow-x-auto hide-scrollbar">
                  {nearbyList.map((p) => (
                    <PlayerCard key={p.user_id} player={p} compact />
                  ))}
                </div>
              </section>
            ) : null}
            {activeList.length > 0 ? (
              <section>
                <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Recently active
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {activeList.slice(0, 4).map((p) => (
                    <PlayerCard key={p.user_id} player={p} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}
