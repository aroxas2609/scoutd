"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryState } from "nuqs";
import { AppHeader } from "@/components/layout/app-header";
import { CoachCard } from "@/components/discovery/coach-card";
import { CoachDiscoverSections } from "@/components/discovery/coach-discover-sections";
import { CoachFilterDrawer } from "@/components/discovery/coach-filter-drawer";
import { useCoachSearch } from "@/features/coaches/hooks";
import { Input } from "@/components/ui/input";
import { Search, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { CoachSearchFilters } from "@/types/database";
import { EmptyStateCinematic } from "@/components/ui/empty-state";
import { useDebouncedValue } from "@/lib/use-debounced-value";

export function CoachSearchView() {
  const [query, setQuery] = useQueryState("q", { defaultValue: "" });
  const debouncedQuery = useDebouncedValue(query, 350);
  const [filters, setFilters] = useState<CoachSearchFilters>({
    query: debouncedQuery || undefined,
  });
  const search = useCoachSearch(filters);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFilters((f) => ({ ...f, query: debouncedQuery || undefined }));
  }, [debouncedQuery]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && search.hasNextPage) search.fetchNextPage();
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [search]);

  const coaches = useMemo(
    () => search.data?.pages.flatMap((p) => p.data ?? []).filter(Boolean) ?? [],
    [search.data]
  );
  const showInitialSkeleton = search.isPending && coaches.length === 0;
  const filterCount = [filters.league, filters.location].filter(Boolean).length;
  const hasActiveFilters = filterCount > 0;
  const isBrowsing = !debouncedQuery.trim() && !hasActiveFilters;

  return (
    <div>
      <AppHeader
        title="Explore"
        subtitle={isBrowsing ? "Browse clubs or search below" : "Clubs and coaches"}
      />
      <div className="sticky top-[65px] z-30 border-b border-white/[0.06] bg-[var(--bg-deep)]/90 px-4 py-3 backdrop-blur-md">
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
      </div>

      {search.isFetching && coaches.length > 0 ? (
        <p className="px-4 py-2 text-center text-xs text-muted-foreground">Updating…</p>
      ) : null}

      {isBrowsing ? (
        <div className="px-4 pb-8 pt-2">
          <CoachDiscoverSections />
        </div>
      ) : (
        <>
          <div className="grid gap-3 px-4 pb-8 pt-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {showInitialSkeleton ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[16/10] rounded-2xl" />
              ))
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
