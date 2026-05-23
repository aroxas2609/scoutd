"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PremiumButton } from "@/components/ui/premium-button";
import { Button } from "@/components/ui/button";
import {
  PlayerFiltersPanel,
  countActivePlayerFilters,
} from "@/components/discovery/player-filters-panel";
import type { PlayerSearchFilters } from "@/types/database";
import { cn } from "@/lib/utils";

export type DrawerFilterState = Pick<
  PlayerSearchFilters,
  "position" | "foot" | "ageMin" | "ageMax" | "willingToTravel" | "gender"
>;

const emptyDrawerFilters: DrawerFilterState = {};

interface FilterDrawerProps {
  filters: DrawerFilterState;
  onChange: (filters: DrawerFilterState) => void;
}

export { countActivePlayerFilters };

export function FilterDrawer({ filters, onChange }: FilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DrawerFilterState>(filters);
  const activeCount = countActivePlayerFilters(filters);
  const draftCount = countActivePlayerFilters(draft);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  function apply() {
    onChange(draft);
    setOpen(false);
  }

  function clearAll() {
    setDraft(emptyDrawerFilters);
    onChange(emptyDrawerFilters);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(
          "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-colors hover:bg-white/[0.08] lg:hidden",
          activeCount > 0 && "border-[var(--accent-brand)]/40 bg-[var(--accent-brand)]/10"
        )}
        aria-label="Filter players"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {activeCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent-brand)] px-1 text-[9px] font-semibold text-[var(--primary-foreground)]">
            {activeCount}
          </span>
        ) : null}
      </SheetTrigger>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="flex max-h-[min(88dvh,680px)] flex-col gap-0 rounded-t-3xl border-white/10 bg-[var(--bg-graphite)] p-0"
      >
        <div className="flex shrink-0 justify-center pt-2">
          <div className="h-1 w-10 rounded-full bg-white/20" aria-hidden />
        </div>
        <SheetHeader className="shrink-0 space-y-1 border-b border-white/[0.06] px-4 pb-3 pt-1 text-left">
          <SheetTitle className="font-display text-xl">Filter players</SheetTitle>
          <p className="text-sm text-muted-foreground">
            Narrow by playing profile. Search above for suburb or postcode; use{" "}
            <span className="font-medium text-foreground/80">Nearby</span> for distance from your
            club.
          </p>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4">
          <PlayerFiltersPanel filters={draft} onChange={setDraft} />
        </div>

        <div className="relative z-20 shrink-0 border-t border-white/[0.06] bg-[var(--bg-graphite)] px-4 pt-3 pb-[max(5.5rem,env(safe-area-inset-bottom))]">
          {draftCount > 0 ? (
            <p className="mb-2 text-center text-xs text-muted-foreground">
              {draftCount} filter{draftCount === 1 ? "" : "s"} selected
            </p>
          ) : null}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 border-white/15 bg-white/[0.04]"
              onClick={clearAll}
              disabled={draftCount === 0}
            >
              Clear all
            </Button>
            <PremiumButton type="button" className="h-11 flex-1" onClick={apply}>
              Show results
            </PremiumButton>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
