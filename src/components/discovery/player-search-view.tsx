"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { AppHeader } from "@/components/layout/app-header";
import { PlayerCard } from "@/components/discovery/player-card";
import { PlayerDiscoverSections } from "@/components/discovery/player-discover-sections";
import { SwipeDeck } from "@/components/discovery/swipe-deck";
import { DiscoverFilterChips } from "@/components/discovery/discover-filter-chips";
import { NearbyRadiusControls } from "@/components/discovery/nearby-radius-controls";
import { PlayersNearClubWidget } from "@/components/discovery/players-near-club-widget";
import {
  FilterDrawer,
  countActivePlayerFilters,
  type DrawerFilterState,
} from "@/components/discovery/filter-drawer";
import { useCoachDistrict, useCoachSearchLocation } from "@/features/coaches/hooks";
import { useIsCoachViewer } from "@/features/auth/use-viewer-role";
import { useFeaturedPlayers, usePlayerSearch, useTrendingPlayers } from "@/features/players/hooks";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { Search, Users, Layers } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { PlayerSearchFilters, PlayerWithDistance } from "@/types/database";
import { EmptyStateCinematic } from "@/components/ui/empty-state";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import {
  DEFAULT_RADIUS_KM,
  isRadiusKm,
  type RadiusKm,
} from "@/lib/geo/location-radius";
export function PlayerSearchView() {
  const [query, setQuery] = useQueryState("q", { defaultValue: "" });
  const [nearbyParam, setNearbyParam] = useQueryState("nearby", parseAsString);
  const [radiusParam, setRadiusParam] = useQueryState("radius", parseAsInteger);
  const debouncedQuery = useDebouncedValue(query, 350);
  const [filterState, setFilterState] = useState<DrawerFilterState>({});
  const [myDistrict, setMyDistrict] = useState(false);
  const [sortByNearest, setSortByNearest] = useState(true);
  const [swipeMode, setSwipeMode] = useState(false);
  const { data: coachDistrict } = useCoachDistrict();
  const coachSearch = useCoachSearchLocation();
  const { isCoach } = useIsCoachViewer();
  const coachAssociationId = coachDistrict?.association_id ?? null;
  const coachPostcode = coachDistrict?.postcode ?? null;

  const nearbyEnabled = nearbyParam === "1";
  const radiusKm: RadiusKm =
    radiusParam != null && isRadiusKm(radiusParam) ? radiusParam : DEFAULT_RADIUS_KM;

  const filters = useMemo<PlayerSearchFilters>(
    () => ({
      ...filterState,
      query: debouncedQuery || undefined,
      coachAssociationId:
        myDistrict && coachAssociationId ? coachAssociationId : undefined,
      coachPostcode:
        filterState.samePostcodeAsCoach && coachPostcode ? coachPostcode : undefined,
      ...(nearbyEnabled && coachSearch.location
        ? {
            radiusKm,
            latitude: coachSearch.location.lat,
            longitude: coachSearch.location.lng,
            sortByNearest,
          }
        : {}),
    }),
    [
      filterState,
      debouncedQuery,
      myDistrict,
      coachAssociationId,
      coachPostcode,
      nearbyEnabled,
      coachSearch.location,
      radiusKm,
      sortByNearest,
    ]
  );

  const search = usePlayerSearch(filters);
  const featured = useFeaturedPlayers();
  const trending = useTrendingPlayers();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const players = useMemo(
    () =>
      (search.data?.pages.flatMap((p) => p.data ?? []).filter(Boolean) ??
        []) as PlayerWithDistance[],
    [search.data]
  );
  const showInitialSkeleton = search.isPending && players.length === 0;
  const hasActiveFilters = countActivePlayerFilters(filterState) > 0;
  const isBrowsing =
    !debouncedQuery.trim() && !hasActiveFilters && !myDistrict && !nearbyEnabled;
  const showDistrictSetup = myDistrict && !coachAssociationId;
  const showNearbySetup =
    nearbyEnabled && !coachSearch.isLoading && !coachSearch.canSearchNearby;
  const showDistrictEmpty =
    myDistrict &&
    !!coachAssociationId &&
    !nearbyEnabled &&
    players.length === 0 &&
    !search.isFetching &&
    !showInitialSkeleton;
  const showNearbyEmpty =
    nearbyEnabled &&
    coachSearch.canSearchNearby &&
    players.length === 0 &&
    !search.isFetching &&
    !showInitialSkeleton;

  function enableNearby() {
    setNearbyParam("1");
    if (radiusParam == null || !isRadiusKm(radiusParam)) {
      setRadiusParam(DEFAULT_RADIUS_KM);
    }
  }

  function toggleNearby() {
    if (nearbyEnabled) {
      setNearbyParam(null);
    } else {
      enableNearby();
    }
  }

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
            : nearbyEnabled
              ? "Players near your club"
              : myDistrict
                ? "Players in your district"
                : isBrowsing
                  ? "Browse players or search below"
                  : "Find players"
        }
      />
      <div className="sticky top-[65px] z-30 border-b border-white/[0.06] bg-[var(--bg-deep)]/95 backdrop-blur-md">
        <div className="space-y-2.5 px-4 pt-3 pb-2">
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value || null)}
                placeholder="Search name, club, suburb…"
                className="h-10 pl-10"
              />
            </div>
            <FilterDrawer
              filters={filterState}
              onChange={setFilterState}
              coachPostcode={coachPostcode}
            />
          </div>
          {isCoach ? (
            <DiscoverFilterChips
              myDistrict={myDistrict}
              onMyDistrictChange={setMyDistrict}
              nearbyEnabled={nearbyEnabled}
              onNearbyToggle={toggleNearby}
            />
          ) : null}
        </div>
        {nearbyEnabled ? (
          <NearbyRadiusControls
            radiusKm={radiusKm}
            onRadiusChange={(km) => setRadiusParam(km)}
            sortByNearest={sortByNearest}
            onSortByNearestChange={setSortByNearest}
            searchLabel={
              coachSearch.label === "Your district" && coachDistrict?.league
                ? coachDistrict.league
                : coachSearch.label
            }
          />
        ) : null}
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

      {showDistrictSetup ? (
        <div className="px-4 pb-8 pt-4">
          <EmptyStateCinematic
            icon={<Users className="h-6 w-6" />}
            title="Add your club district"
            description="Add your club district to find players in your area."
            action={
              <Link href="/profile" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Go to profile
              </Link>
            }
          />
        </div>
      ) : showNearbySetup ? (
        <div className="px-4 pb-8 pt-4">
          <EmptyStateCinematic
            icon={<Users className="h-6 w-6" />}
            title="Add your club location"
            description="Add your club suburb or postcode to search nearby players."
            action={
              <Link href="/profile" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Go to profile
              </Link>
            }
          />
        </div>
      ) : isBrowsing ? (
        swipeMode ? (
          <div className="px-4 pb-8 pt-2">
            <SwipeDeck players={swipePlayers} />
          </div>
        ) : (
          <div className="px-4 pb-8 pt-4">
            {isCoach ? (
              <PlayersNearClubWidget onSearchNearby={enableNearby} />
            ) : null}
            <PlayerDiscoverSections hideNearbySection={isCoach} />
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
            ) : showDistrictEmpty ? (
              <EmptyStateCinematic
                icon={<Users className="h-6 w-6" />}
                title="No players in your district"
                description="No players found in your district yet."
              />
            ) : showNearbyEmpty ? (
              <EmptyStateCinematic
                icon={<Users className="h-6 w-6" />}
                title="No nearby players found"
                description="Try expanding your radius or using My District instead."
              />
            ) : players.length === 0 && !search.isFetching ? (
              <EmptyStateCinematic
                icon={<Users className="h-6 w-6" />}
                title="No players found"
                description="Try a different search or adjust filters."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {players.map((p) => (
                  <PlayerCard
                    key={p.user_id}
                    player={p}
                    distanceKm={p.distanceKm}
                  />
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
