"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryState } from "nuqs";
import { AppHeader } from "@/components/layout/app-header";
import { PlayerCard } from "@/components/discovery/player-card";
import { PlayerDiscoverSections } from "@/components/discovery/player-discover-sections";
import { SwipeDeck } from "@/components/discovery/swipe-deck";
import { FilterDrawer, countActivePlayerFilters } from "@/components/discovery/filter-drawer";
import { useFeaturedPlayers, usePlayerSearch, useTrendingPlayers } from "@/features/players/hooks";
import { Input } from "@/components/ui/input";
import { Search, Users, Layers } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { PlayerSearchFilters } from "@/types/database";
import { EmptyStateCinematic } from "@/components/ui/empty-state";
import { useDebouncedValue } from "@/lib/use-debounced-value";

export function PlayerSearchView() {
  const [query, setQuery] = useQueryState("q", { defaultValue: "" });
  const debouncedQuery = useDebouncedValue(query, 350);
  const [filters, setFilters] = useState<PlayerSearchFilters>({
    query: debouncedQuery || undefined,
  });
  const [swipeMode, setSwipeMode] = useState(false);
  const search = usePlayerSearch(filters);
  const featured = useFeaturedPlayers();
  const trending = useTrendingPlayers();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFilters((f) => ({ ...f, query: debouncedQuery || undefined }));
  }, [debouncedQuery]);

  const players = useMemo(
    () => search.data?.pages.flatMap((p) => p.data ?? []).filter(Boolean) ?? [],
    [search.data]
  );
  const showInitialSkeleton = search.isPending && players.length === 0;
  const hasActiveFilters = countActivePlayerFilters(filters) > 0;
  const isBrowsing = !debouncedQuery.trim() && !hasActiveFilters;

  useEffect(() => {
    if (isBrowsing) return;
    const el = loadMoreRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && search.hasNextPage) search.fetchNextPage();
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [search, isBrowsing]);

  const featuredList = featured.data?.data ?? [];
  const trendingList = trending.data?.data ?? [];
  const swipePlayers = featuredList.length ? featuredList : trendingList;
  const canSwipe = isBrowsing && swipePlayers.length > 0;

  useEffect(() => {
    if (!isBrowsing) setSwipeMode(false);
  }, [isBrowsing]);

  return (
    <div>
      <AppHeader
        title="Discover"
        subtitle={
          swipeMode
            ? "Swipe to scout"
            : isBrowsing
              ? "Browse players or search below"
              : "Find players"
        }
      />
      <div className="sticky top-[65px] z-30 border-b border-white/[0.06] bg-[var(--bg-deep)]/90 px-4 py-3 backdrop-blur-md">
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value || null)}
              placeholder="Name, club, location…"
              className="pl-10"
            />
          </div>
          <FilterDrawer filters={filters} onChange={setFilters} />
        </div>
      </div>

      {canSwipe ? (
        <button
          type="button"
          onClick={() => setSwipeMode(!swipeMode)}
          className="fixed bottom-28 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-zinc-900 shadow-lg"
          aria-label={swipeMode ? "Show browse lists" : "Swipe to scout"}
        >
          <Layers className="h-6 w-6" />
        </button>
      ) : null}

      {search.isFetching && players.length > 0 ? (
        <p className="px-4 py-2 text-center text-xs text-muted-foreground">Updating…</p>
      ) : null}

      {isBrowsing ? (
        swipeMode ? (
          <div className="px-4 pb-8 pt-2">
            <SwipeDeck players={swipePlayers} />
          </div>
        ) : (
          <div className="px-4 pb-8 pt-2">
            <PlayerDiscoverSections />
          </div>
        )
      ) : (
        <>
          <div className="px-4 pb-8 pt-4">
            {showInitialSkeleton ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
                ))}
              </div>
            ) : players.length === 0 && !search.isFetching ? (
              <EmptyStateCinematic
                icon={<Users className="h-6 w-6" />}
                title="No players found"
                description="Try a different search or adjust filters."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {players.map((p) => (
                  <PlayerCard key={p.user_id} player={p} />
                ))}
              </div>
            )}
          </div>
          <div ref={loadMoreRef} className="h-4" />
        </>
      )}
    </div>
  );
}
