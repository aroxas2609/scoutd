"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { parseAsString, useQueryState } from "nuqs";
import { AppHeader } from "@/components/layout/app-header";
import { CoachCard } from "@/components/discovery/coach-card";
import { CoachDiscoverSections } from "@/components/discovery/coach-discover-sections";
import { DiscoverFilterChips } from "@/components/discovery/discover-filter-chips";
import { PageLoader } from "@/components/ui/page-loader";
import { useCoachSearch } from "@/features/coaches/hooks";
import { shouldRunCoachSearch } from "@/features/coaches/search-enabled";

const CoachFilterDrawer = dynamic(
  () =>
    import("@/components/discovery/coach-filter-drawer").then((m) => m.CoachFilterDrawer),
  { loading: () => <PageLoader /> }
);
import { Input } from "@/components/ui/input";
import { Search, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { CoachSearchFilters } from "@/types/database";
import { EmptyStateCinematic } from "@/components/ui/empty-state";
import { useDebouncedValue } from "@/lib/use-debounced-value";

type CoachSearchViewProps = {
  hideHeader?: boolean;
};

export function CoachSearchView({ hideHeader = false }: CoachSearchViewProps) {
  const [query, setQuery] = useQueryState("q", { defaultValue: "" });
  const [allParam, setAllParam] = useQueryState("all", parseAsString);
  const debouncedQuery = useDebouncedValue(query, 350);
  const [filters, setFilters] = useState<CoachSearchFilters>({
    query: debouncedQuery || undefined,
  });
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const catalogEnabled = allParam === "1";
  const filterCount = [filters.league, filters.location].filter(Boolean).length;
  const hasActiveFilters = filterCount > 0;
  const hasTextQuery = !!debouncedQuery.trim();
  const isBrowsing = !catalogEnabled && !hasTextQuery && !hasActiveFilters;

  const search = useCoachSearch(filters, {
    enabled: shouldRunCoachSearch({
      isBrowsing,
      hasQuery: hasTextQuery,
      hasActiveFilters,
      catalogEnabled,
    }),
  });

  useEffect(() => {
    setFilters((f) => ({ ...f, query: debouncedQuery || undefined }));
  }, [debouncedQuery]);

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

  const coaches = useMemo(
    () => search.data?.pages.flatMap((p) => p.data ?? []).filter(Boolean) ?? [],
    [search.data]
  );
  const showInitialSkeleton = search.isPending && coaches.length === 0;
  const showCatalogEmpty =
    catalogEnabled &&
    !hasTextQuery &&
    coaches.length === 0 &&
    !search.isFetching &&
    !showInitialSkeleton;

  function enableCatalog() {
    void setAllParam("1");
  }

  function toggleCatalog() {
    if (catalogEnabled) {
      void setAllParam(null);
    } else {
      enableCatalog();
    }
  }

  const headerSubtitle = catalogEnabled
    ? "Browsing all clubs"
    : isBrowsing
      ? "Browse clubs or search below"
      : "Clubs and coaches";

  return (
    <div>
      {!hideHeader ? (
        <AppHeader title="Explore" subtitle={headerSubtitle} />
      ) : null}
      <div className="sticky top-[65px] z-30 border-b border-white/[0.06] bg-[var(--bg-deep)]/90 px-4 py-3 backdrop-blur-md lg:top-[4.5rem] lg:px-6 lg:py-4">
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value || null)}
                placeholder="Club, association, location…"
                className="pl-10"
              />
            </div>
            <CoachFilterDrawer filters={filters} onChange={setFilters} />
          </div>
          <DiscoverFilterChips
            myDistrict={false}
            onMyDistrictChange={() => {}}
            nearbyEnabled={false}
            onNearbyToggle={() => {}}
            catalogEnabled={catalogEnabled}
            onCatalogToggle={toggleCatalog}
            catalogLabel="All clubs"
            showNearby={false}
            showMyDistrict={false}
          />
        </div>
      </div>

      {search.isFetching && coaches.length > 0 ? (
        <p className="px-4 py-2 text-center text-xs text-muted-foreground">Updating…</p>
      ) : null}

      {isBrowsing ? (
        <div className="px-4 pb-8 pt-2 lg:px-0 lg:pb-10 lg:pt-4">
          <CoachDiscoverSections />
        </div>
      ) : (
        <>
          <div className="grid gap-3 px-4 pb-8 pt-4 sm:grid-cols-2 lg:grid-cols-2 lg:px-0 xl:grid-cols-3 2xl:grid-cols-4">
            {showInitialSkeleton ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[16/10] rounded-2xl" />
              ))
            ) : showCatalogEmpty ? (
              <div className="col-span-full">
                <EmptyStateCinematic
                  icon={<Building2 className="h-6 w-6" />}
                  title="No clubs yet"
                  description="When coaches join Scoutd, their clubs will show up here."
                />
              </div>
            ) : coaches.length === 0 && !search.isFetching ? (
              <div className="col-span-full">
                <EmptyStateCinematic
                  icon={<Building2 className="h-6 w-6" />}
                  title="No clubs found"
                  description="Try another search or adjust filters."
                />
              </div>
            ) : (
              coaches.map((c) => <CoachCard key={c.user_id} coach={c} />)
            )}
          </div>
          <div ref={loadMoreRef} className="h-4" />
        </>
      )}
    </div>
  );
}
