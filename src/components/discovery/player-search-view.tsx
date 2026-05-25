"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { AppHeader } from "@/components/layout/app-header";
import { PlayerCard } from "@/components/discovery/player-card";
import { PlayerDiscoverSections } from "@/components/discovery/player-discover-sections";
import { PageLoader } from "@/components/ui/page-loader";

const SwipeDeck = dynamic(
  () => import("@/components/discovery/swipe-deck").then((m) => m.SwipeDeck),
  { loading: () => <PageLoader /> }
);
import { DiscoverFilterChips } from "@/components/discovery/discover-filter-chips";
import { NearbyRadiusControls } from "@/components/discovery/nearby-radius-controls";
import { PlayersNearClubWidget } from "@/components/discovery/players-near-club-widget";
import {
  countActivePlayerFilters,
  type DrawerFilterState,
} from "@/components/discovery/filter-drawer";

const FilterDrawer = dynamic(
  () => import("@/components/discovery/filter-drawer").then((m) => m.FilterDrawer),
  { loading: () => <PageLoader /> }
);
import { PlayerFiltersSidebar } from "@/components/discovery/player-filters-sidebar";
import { useCoachDistrict, useCoachSearchLocation } from "@/features/coaches/hooks";
import { useQuery } from "@tanstack/react-query";
import { AUTH_USER_ID_KEY } from "@/features/auth/auth-query-cache";
import { fetchAuthUserId } from "@/features/auth/use-viewer-role";
import {
  useFeaturedPlayers,
  usePlayerDistrict,
  usePlayerSearch,
  usePlayerSearchLocation,
  useTrendingPlayers,
  type PlayerListOptions,
} from "@/features/players/hooks";
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
import { shouldRunPlayerSearch } from "@/features/players/search-enabled";

const PLAYER_SEARCH_DEBOUNCE_MS = 350;

type PlayerSearchViewProps = {
  viewerMode?: "coach" | "player";
  hideHeader?: boolean;
};

export function PlayerSearchView({
  viewerMode = "coach",
  hideHeader = false,
}: PlayerSearchViewProps) {
  const isCoachMode = viewerMode === "coach";
  const [urlQuery, setUrlQuery] = useQueryState("q", { defaultValue: "", shallow: true });
  const [searchInput, setSearchInput] = useState(() => urlQuery);
  const [nearbyParam, setNearbyParam] = useQueryState("nearby", parseAsString);
  const [allParam, setAllParam] = useQueryState("all", parseAsString);
  const [radiusParam, setRadiusParam] = useQueryState("radius", parseAsInteger);
  const debouncedQuery = useDebouncedValue(searchInput, PLAYER_SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    const next = debouncedQuery.trim();
    const current = (urlQuery ?? "").trim();
    if (next !== current) {
      void setUrlQuery(next || null);
    }
  }, [debouncedQuery, urlQuery, setUrlQuery]);
  const [filterState, setFilterState] = useState<DrawerFilterState>({});
  const [myDistrict, setMyDistrict] = useState(false);
  const [sortByNearest, setSortByNearest] = useState(true);
  const [swipeMode, setSwipeMode] = useState(false);
  const { data: coachDistrict } = useCoachDistrict(isCoachMode);
  const coachSearch = useCoachSearchLocation(isCoachMode);
  const { data: playerDistrict } = usePlayerDistrict(!isCoachMode);
  const playerSearch = usePlayerSearchLocation(!isCoachMode);
  const authUser = useQuery({
    queryKey: AUTH_USER_ID_KEY,
    queryFn: fetchAuthUserId,
    staleTime: 2 * 60 * 1000,
    refetchOnMount: false,
    enabled: !isCoachMode,
  });

  const districtProfile = isCoachMode ? coachDistrict : playerDistrict;
  const searchLocation = isCoachMode ? coachSearch : playerSearch;
  const associationId = districtProfile?.association_id ?? null;

  const listOptions: PlayerListOptions | undefined =
    !isCoachMode && authUser.data
      ? { excludeUserId: authUser.data }
      : undefined;

  const nearbyEnabled = nearbyParam === "1";
  const catalogEnabled = allParam === "1";
  const radiusKm: RadiusKm =
    radiusParam != null && isRadiusKm(radiusParam) ? radiusParam : DEFAULT_RADIUS_KM;

  const filters = useMemo<PlayerSearchFilters>(
    () => ({
      ...filterState,
      query: debouncedQuery || undefined,
      coachAssociationId:
        !catalogEnabled && myDistrict && associationId ? associationId : undefined,
      ...(!catalogEnabled &&
      nearbyEnabled &&
      searchLocation.location
        ? {
            radiusKm,
            latitude: searchLocation.location.lat,
            longitude: searchLocation.location.lng,
            originPostcode: districtProfile?.postcode ?? undefined,
            sortByNearest,
          }
        : {}),
    }),
    [
      filterState,
      debouncedQuery,
      catalogEnabled,
      myDistrict,
      associationId,
      nearbyEnabled,
      searchLocation.location,
      districtProfile?.postcode,
      radiusKm,
      sortByNearest,
    ]
  );

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters = countActivePlayerFilters(filterState) > 0;
  const hasTextQuery = !!debouncedQuery.trim();
  const isBrowsing =
    !catalogEnabled &&
    !hasTextQuery &&
    !hasActiveFilters &&
    !myDistrict &&
    !nearbyEnabled;

  const featured = useFeaturedPlayers({ enabled: isBrowsing, ...listOptions });
  const trending = useTrendingPlayers({ enabled: isBrowsing, ...listOptions });

  const search = usePlayerSearch(filters, {
    enabled: shouldRunPlayerSearch({
      isBrowsing,
      hasQuery: !!debouncedQuery.trim(),
      hasActiveFilters,
      myDistrict,
      nearbyEnabled,
      catalogEnabled,
    }),
    ...listOptions,
  });

  const players = useMemo(
    () =>
      (search.data?.pages.flatMap((p) => p.data ?? []).filter(Boolean) ??
        []) as PlayerWithDistance[],
    [search.data]
  );
  const showInitialSkeleton =
    search.isPending && !search.isPlaceholderData && players.length === 0;
  const hasSearchQuery = !!debouncedQuery.trim();
  const activelySearching =
    catalogEnabled ||
    searchInput.trim().length > 0 ||
    hasActiveFilters ||
    myDistrict;
  const showCatalogEmpty =
    catalogEnabled &&
    !hasSearchQuery &&
    players.length === 0 &&
    !search.isFetching &&
    !showInitialSkeleton;
  const showDistrictSetup = myDistrict && !associationId && !activelySearching;
  const showNearbySetup =
    nearbyEnabled &&
    !searchLocation.isLoading &&
    !searchLocation.canSearchNearby &&
    !activelySearching;
  const showDistrictEmpty =
    myDistrict &&
    !!associationId &&
    !nearbyEnabled &&
    players.length === 0 &&
    !search.isFetching &&
    !showInitialSkeleton;
  const showNearbyEmpty =
    nearbyEnabled &&
    searchLocation.canSearchNearby &&
    players.length === 0 &&
    !search.isFetching &&
    !showInitialSkeleton &&
    !hasSearchQuery;
  const showSearchEmpty =
    hasSearchQuery &&
    players.length === 0 &&
    !search.isFetching &&
    !showInitialSkeleton;

  function enableCatalog() {
    void setAllParam("1");
    void setNearbyParam(null);
    setMyDistrict(false);
  }

  function toggleCatalog() {
    if (catalogEnabled) {
      void setAllParam(null);
    } else {
      enableCatalog();
    }
  }

  function handleMyDistrictChange(value: boolean) {
    if (value) {
      void setAllParam(null);
    }
    setMyDistrict(value);
  }

  function enableNearby() {
    void setAllParam(null);
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

  const catalogChipLabel = "All players";

  const fetchNextPage = search.fetchNextPage;
  const hasNextPage = search.hasNextPage;

  useEffect(() => {
    if (isBrowsing) return;
    const el = loadMoreRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && hasNextPage) void fetchNextPage();
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [fetchNextPage, hasNextPage, isBrowsing]);

  const featuredList = featured.data?.data ?? [];
  const trendingList = trending.data?.data ?? [];
  const swipePlayers = featuredList.length ? featuredList : trendingList;
  const canSwipe = isCoachMode && isBrowsing && swipePlayers.length > 0;

  useEffect(() => {
    if (!isBrowsing) setSwipeMode(false);
  }, [isBrowsing]);

  const headerTitle = isCoachMode ? "Discover" : "Players";
  const headerSubtitle = swipeMode
    ? "Swipe to scout"
    : catalogEnabled
      ? "Browsing all players"
      : nearbyEnabled
        ? isCoachMode
          ? "Players near your club"
          : "Players near you"
        : myDistrict
          ? "Players in your district"
          : isBrowsing
            ? isCoachMode
              ? "Browse players or search below"
              : "Find teammates and browse highlights"
            : "Find players";

  return (
    <div>
      {!hideHeader ? (
        <AppHeader title={headerTitle} subtitle={headerSubtitle} />
      ) : null}
      {isCoachMode ? (
        <div className="hidden border-b border-white/[0.06] bg-[var(--bg-deep)]/95 lg:block lg:px-6 lg:pb-4 lg:pt-2">
          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search name, club, suburb…"
                className="h-11 pl-10"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <DiscoverFilterChips
              myDistrict={myDistrict}
              onMyDistrictChange={handleMyDistrictChange}
              nearbyEnabled={nearbyEnabled}
              onNearbyToggle={toggleNearby}
              catalogEnabled={catalogEnabled}
              onCatalogToggle={toggleCatalog}
              catalogLabel={catalogChipLabel}
              showMyDistrict={isCoachMode}
            />
          </div>
          {nearbyEnabled && !catalogEnabled ? (
            <NearbyRadiusControls
              className="mt-3 border-t-0 px-0 py-0"
              radiusKm={radiusKm}
              onRadiusChange={(km) => setRadiusParam(km)}
              sortByNearest={sortByNearest}
              onSortByNearestChange={setSortByNearest}
              searchLabel={
                isCoachMode &&
                coachSearch.label === "Your district" &&
                coachDistrict?.league
                  ? coachDistrict.league
                  : searchLocation.label
              }
            />
          ) : null}
        </div>
      ) : null}
      <div
        className={
          isCoachMode
            ? "lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[17.5rem_minmax(0,1fr)] lg:items-start lg:gap-6 lg:px-6 lg:pt-4"
            : undefined
        }
      >
        {isCoachMode ? (
          <PlayerFiltersSidebar filters={filterState} onChange={setFilterState} />
        ) : null}
        <div className="min-w-0">
      <div
        className={
          isCoachMode
            ? "sticky top-[65px] z-30 border-b border-white/[0.06] bg-[var(--bg-deep)]/95 backdrop-blur-md lg:hidden"
            : "sticky top-[65px] z-30 border-b border-white/[0.06] bg-[var(--bg-deep)]/95 backdrop-blur-md lg:top-[4.5rem]"
        }
      >
        <div className="space-y-3 px-4 pt-3.5 pb-2.5 lg:space-y-2.5 lg:pt-3 lg:pb-2">
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search name, club, suburb…"
                className="h-10 pl-10"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <FilterDrawer filters={filterState} onChange={setFilterState} />
          </div>
          <DiscoverFilterChips
            myDistrict={myDistrict}
            onMyDistrictChange={handleMyDistrictChange}
            nearbyEnabled={nearbyEnabled}
            onNearbyToggle={toggleNearby}
            catalogEnabled={catalogEnabled}
            onCatalogToggle={toggleCatalog}
            catalogLabel={catalogChipLabel}
            showMyDistrict={isCoachMode}
          />
        </div>
        {nearbyEnabled && !catalogEnabled ? (
          <NearbyRadiusControls
            radiusKm={radiusKm}
            onRadiusChange={(km) => setRadiusParam(km)}
            sortByNearest={sortByNearest}
            onSortByNearestChange={setSortByNearest}
            searchLabel={
              isCoachMode &&
              coachSearch.label === "Your district" &&
              coachDistrict?.league
                ? coachDistrict.league
                : searchLocation.label
            }
          />
        ) : null}
      </div>

      {canSwipe ? (
        <button
          type="button"
          onClick={() => setSwipeMode(!swipeMode)}
          className="fixed bottom-28 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-brand)] text-[var(--primary-foreground)] shadow-lg lg:bottom-8 lg:right-8"
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
            title={isCoachMode ? "Add your club district" : "Add your district"}
            description={
              isCoachMode
                ? "Add your club district to find players in your area."
                : "Add your district on your profile to find players in your area."
            }
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
            title={isCoachMode ? "Add your club location" : "Add your location"}
            description={
              isCoachMode
                ? "Add your club suburb or postcode to search nearby players."
                : "Add your suburb or postcode on your profile to find nearby players."
            }
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
          <div className="px-4 pb-10 pt-5 lg:px-0 lg:pb-8 lg:pt-4">
            {isCoachMode ? <PlayersNearClubWidget onSearchNearby={enableNearby} /> : null}
            <PlayerDiscoverSections
              hideNearbySection={isCoachMode}
              featuredList={featuredList}
              trendingList={trendingList}
              listOptions={listOptions}
              nearbyOptions={
                isCoachMode
                  ? { locationSource: "coach", ...listOptions }
                  : { locationSource: "player", ...listOptions }
              }
            />
          </div>
        )
      ) : (
        <>
          <div className="px-4 pb-10 pt-5 lg:px-4 lg:pb-8 lg:pt-4">
            {showInitialSkeleton ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:gap-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
                ))}
              </div>
            ) : search.isError ? (
              <EmptyStateCinematic
                icon={<Users className="h-6 w-6" />}
                title="Could not load players"
                description={
                  nearbyEnabled
                    ? "Nearby search failed — try a smaller radius (25 km or less), or turn off Nearby and search by name."
                    : search.error instanceof Error
                      ? search.error.message
                      : "Something went wrong while searching. Try again in a moment."
                }
              />
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
            ) : showCatalogEmpty ? (
              <EmptyStateCinematic
                icon={<Users className="h-6 w-6" />}
                title="No players yet"
                description="When players join Scoutd, they will show up here."
              />
            ) : showSearchEmpty ? (
              <EmptyStateCinematic
                icon={<Users className="h-6 w-6" />}
                title="No players found"
                description={
                  nearbyEnabled
                    ? "No one matched that name. Turn off Nearby to search everywhere, or check the spelling."
                    : isCoachMode
                      ? "Try a different search or adjust filters."
                      : "Try another name or suburb. You won’t see your own profile in results — ask a teammate to search for you, or check the name matches their profile exactly."
                }
              />
            ) : players.length === 0 && !search.isFetching ? (
              <EmptyStateCinematic
                icon={<Users className="h-6 w-6" />}
                title="No players found"
                description={
                  isCoachMode
                    ? "Try a different search or adjust filters."
                    : "Try a different search or widen your filters to find teammates."
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:gap-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
      </div>
    </div>
  );
}
