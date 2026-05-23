"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayerFiltersPanel, countActivePlayerFilters } from "@/components/discovery/player-filters-panel";
import type { DrawerFilterState } from "@/components/discovery/filter-drawer";

const emptyDrawerFilters: DrawerFilterState = {};

type PlayerFiltersSidebarProps = {
  filters: DrawerFilterState;
  onChange: (filters: DrawerFilterState) => void;
};

export function PlayerFiltersSidebar({ filters, onChange }: PlayerFiltersSidebarProps) {
  const activeCount = countActivePlayerFilters(filters);

  return (
    <aside className="hidden lg:block lg:w-full lg:shrink-0">
      <div className="sticky top-[7.25rem] max-h-[calc(100dvh-8.5rem)] overflow-y-auto rounded-2xl border border-white/[0.08] bg-[var(--bg-surface)] p-4 lg:rounded-xl">
        <div className="mb-4 flex items-center justify-between gap-2 lg:mb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-display text-lg font-semibold">Filters</h2>
          </div>
          {activeCount > 0 ? (
            <span className="rounded-full bg-[var(--accent-brand)]/15 px-2 py-0.5 text-xs font-medium text-[var(--accent-brand)]">
              {activeCount}
            </span>
          ) : null}
        </div>
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground lg:mb-3">
          <span className="lg:hidden">
            Narrow by playing profile. Use the search bar for suburb or postcode.
          </span>
          <span className="hidden lg:inline">
            Narrow by profile. Search bar handles suburb or postcode.
          </span>
        </p>
        <PlayerFiltersPanel filters={filters} onChange={onChange} />
        {activeCount > 0 ? (
          <Button
            type="button"
            variant="outline"
            className="mt-6 h-10 w-full border-white/15 bg-white/[0.04]"
            onClick={() => onChange(emptyDrawerFilters)}
          >
            Clear all
          </Button>
        ) : null}
      </div>
    </aside>
  );
}
