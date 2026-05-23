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
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { PremiumButton } from "@/components/ui/premium-button";
import { Button } from "@/components/ui/button";
import { SheetSelect } from "@/components/forms/sheet-select";
import { PositionSelect } from "@/components/forms/position-select";
import { DOMINANT_FOOT_OPTIONS } from "@/lib/form-options";
import type { PlayerSearchFilters } from "@/types/database";
import { cn } from "@/lib/utils";

interface FilterDrawerProps {
  filters: PlayerSearchFilters;
  onChange: (filters: PlayerSearchFilters) => void;
}

const emptyFilters: PlayerSearchFilters = {};

export function countActivePlayerFilters(filters: PlayerSearchFilters) {
  let n = 0;
  if (filters.position) n++;
  if (filters.foot) n++;
  if (filters.ageMin != null) n++;
  if (filters.ageMax != null) n++;
  if (filters.willingToTravel !== undefined) n++;
  return n;
}

export function FilterDrawer({ filters, onChange }: FilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<PlayerSearchFilters>(filters);
  const activeCount = countActivePlayerFilters(filters);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

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
        aria-label="Filter players"
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
          <SheetTitle className="font-display text-xl">Filter players</SheetTitle>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-y-contain px-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Min age</Label>
              <Input
                type="number"
                className="bg-white/5"
                value={draft.ageMin ?? ""}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    ageMin: Number(e.target.value) || undefined,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Max age</Label>
              <Input
                type="number"
                className="bg-white/5"
                value={draft.ageMax ?? ""}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    ageMax: Number(e.target.value) || undefined,
                  }))
                }
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Position</Label>
            <PositionSelect
              value={draft.position ?? ""}
              onValueChange={(v) =>
                setDraft((prev) => ({ ...prev, position: v || undefined }))
              }
              placeholder="Any position"
              allowClear
              clearLabel="Any position"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Dominant foot</Label>
            <SheetSelect
              value={draft.foot ?? ""}
              onValueChange={(v) =>
                setDraft((prev) => ({
                  ...prev,
                  foot: (v as PlayerSearchFilters["foot"]) || undefined,
                }))
              }
              options={[...DOMINANT_FOOT_OPTIONS]}
              placeholder="Any"
              sheetTitle="Dominant foot"
              allowClear
              clearLabel="Any foot"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Willing to travel</Label>
            <SegmentedControl<"any" | "yes" | "no">
              segments={[
                { value: "any", label: "Any" },
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              value={
                draft.willingToTravel === true
                  ? "yes"
                  : draft.willingToTravel === false
                    ? "no"
                    : "any"
              }
              onChange={(v) =>
                setDraft((prev) => ({
                  ...prev,
                  willingToTravel:
                    v === "yes" ? true : v === "no" ? false : undefined,
                }))
              }
            />
          </div>
        </div>

        <div className="flex shrink-0 gap-2 border-t border-white/[0.06] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-white/15 bg-transparent"
            onClick={clearAll}
            disabled={countActivePlayerFilters(draft) === 0}
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
