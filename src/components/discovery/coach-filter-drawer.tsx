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
import { Label } from "@/components/ui/label";
import { AssociationSelect } from "@/components/forms/association-select";
import { AustraliaLocationField } from "@/components/forms/australia-location-field";
import { PremiumButton } from "@/components/ui/premium-button";
import { Button } from "@/components/ui/button";
import {
  formatAustraliaLocation,
  parseStoredAustraliaLocation,
} from "@/lib/location/australia";
import type { CoachSearchFilters } from "@/types/database";
import { cn } from "@/lib/utils";

interface CoachFilterDrawerProps {
  filters: CoachSearchFilters;
  onChange: (filters: CoachSearchFilters) => void;
}

const emptyFilters: CoachSearchFilters = {};

function countActiveFilters(filters: CoachSearchFilters) {
  return [filters.location, filters.league].filter(Boolean).length;
}

export function CoachFilterDrawer({ filters, onChange }: CoachFilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CoachSearchFilters>(filters);
  const activeCount = countActiveFilters(filters);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const locationParts = parseStoredAustraliaLocation(draft.location, null);

  function apply() {
    onChange(draft);
    setOpen(false);
  }

  function clearAll() {
    setDraft(emptyFilters);
    onChange(emptyFilters);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(
          "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-colors hover:bg-white/[0.08]",
          activeCount > 0 && "border-[var(--accent-brand)]/40 bg-[var(--accent-brand)]/10"
        )}
        aria-label="Filter clubs"
      >
        <SlidersHorizontal className="h-5 w-5" />
        {activeCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent-brand)] px-1 text-[9px] font-semibold text-[var(--primary-foreground)]">
            {activeCount}
          </span>
        ) : null}
      </SheetTrigger>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="flex max-h-[min(85dvh,640px)] flex-col gap-0 rounded-t-3xl border-white/10 bg-[var(--bg-graphite)] p-0"
      >
        <div className="flex shrink-0 justify-center pt-2">
          <div className="h-1 w-10 rounded-full bg-white/20" aria-hidden />
        </div>
        <SheetHeader className="shrink-0 border-b border-white/[0.06] px-4 pb-3 pt-1 text-left">
          <SheetTitle className="font-display text-xl">Filter clubs</SheetTitle>
          <p className="text-sm text-muted-foreground">
            Narrow by suburb or association
          </p>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-y-contain px-4 py-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Suburb</Label>
            <AustraliaLocationField
              suburb={locationParts.suburb}
              state={locationParts.state}
              postcode={locationParts.postcode}
              onSelect={(option) => {
                setDraft((prev) => ({
                  ...prev,
                  location: formatAustraliaLocation(
                    option.suburb,
                    option.state,
                    option.postcode
                  ),
                }));
              }}
              onClear={() =>
                setDraft((prev) => ({
                  ...prev,
                  location: undefined,
                }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Association</Label>
            <AssociationSelect
              value={draft.league ?? ""}
              onValueChange={(v) =>
                setDraft((prev) => ({ ...prev, league: v || undefined }))
              }
              placeholder="Any association"
              allowClear
              clearLabel="Any association"
            />
          </div>
        </div>

        <div className="flex shrink-0 gap-2 border-t border-white/[0.06] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-white/15 bg-transparent"
            onClick={clearAll}
            disabled={countActiveFilters(draft) === 0}
          >
            Clear
          </Button>
          <PremiumButton type="button" className="flex-1" onClick={apply}>
            Apply filters
          </PremiumButton>
        </div>
      </SheetContent>
    </Sheet>
  );
}
