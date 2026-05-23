"use client";

import { useEffect, useState, type ReactNode } from "react";
import { MapPin, SlidersHorizontal, UserRound } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { PremiumButton } from "@/components/ui/premium-button";
import { Button } from "@/components/ui/button";
import { SheetSelect } from "@/components/forms/sheet-select";
import { PositionSelect } from "@/components/forms/position-select";
import { DOMINANT_FOOT_OPTIONS } from "@/lib/form-options";
import type { PlayerSearchFilters } from "@/types/database";
import { cn } from "@/lib/utils";

export type DrawerFilterState = Pick<
  PlayerSearchFilters,
  | "position"
  | "foot"
  | "ageMin"
  | "ageMax"
  | "willingToTravel"
  | "samePostcodeAsCoach"
  | "gender"
>;

const emptyDrawerFilters: DrawerFilterState = {};

interface FilterDrawerProps {
  filters: DrawerFilterState;
  onChange: (filters: DrawerFilterState) => void;
  coachPostcode?: string | null;
}

export function countActivePlayerFilters(filters: PlayerSearchFilters | DrawerFilterState) {
  let n = 0;
  if (filters.position) n++;
  if (filters.foot) n++;
  if (filters.ageMin != null) n++;
  if (filters.ageMax != null) n++;
  if (filters.willingToTravel !== undefined) n++;
  if (filters.samePostcodeAsCoach) n++;
  if (filters.gender) n++;
  return n;
}

function FilterSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof MapPin;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="space-y-3 pl-6">{children}</div>
    </section>
  );
}

export function FilterDrawer({ filters, onChange, coachPostcode }: FilterDrawerProps) {
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
          "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-colors hover:bg-white/[0.08]",
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
            Narrow by playing profile and club match. Search above for suburb or postcode; use{" "}
            <span className="font-medium text-foreground/80">Nearby</span> for distance from your
            club.
          </p>
        </SheetHeader>

        <div className="min-h-0 flex-1 divide-y divide-white/[0.06] overflow-y-auto overscroll-y-contain">
          <div className="space-y-6 px-4 py-4">
            <FilterSection
              icon={MapPin}
              title="Club match"
              description="One-tap match to your club postcode. For other areas, use the search bar."
            >
              <div className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5 ring-1 ring-white/[0.06]">
                <div className="min-w-0 pr-2">
                  <Label htmlFor="filter-same-postcode" className="text-sm font-medium">
                    Same postcode as my club
                  </Label>
                  {!coachPostcode?.trim() ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Add your club postcode in profile settings.
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-muted-foreground">Club postcode {coachPostcode}</p>
                  )}
                </div>
                <Switch
                  id="filter-same-postcode"
                  checked={draft.samePostcodeAsCoach ?? false}
                  disabled={!coachPostcode?.trim()}
                  onCheckedChange={(checked) =>
                    setDraft((prev) => ({
                      ...prev,
                      samePostcodeAsCoach: checked || undefined,
                    }))
                  }
                />
              </div>
            </FilterSection>
          </div>

          <div className="space-y-4 px-4 py-4">
            <FilterSection
              icon={UserRound}
              title="Player profile"
              description="Age, position, gender, and availability."
            >
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Gender</Label>
                <SegmentedControl<"any" | "female" | "male">
                  segments={[
                    { value: "any", label: "Any" },
                    { value: "female", label: "Female" },
                    { value: "male", label: "Male" },
                  ]}
                  value={draft.gender ?? "any"}
                  onChange={(v) =>
                    setDraft((prev) => ({
                      ...prev,
                      gender: v === "any" ? undefined : v,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="filter-age-min" className="text-xs text-muted-foreground">
                    Min age
                  </Label>
                  <Input
                    id="filter-age-min"
                    type="number"
                    min={14}
                    max={50}
                    placeholder="14"
                    className="h-10 bg-white/[0.04]"
                    value={draft.ageMin ?? ""}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        ageMin: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="filter-age-max" className="text-xs text-muted-foreground">
                    Max age
                  </Label>
                  <Input
                    id="filter-age-max"
                    type="number"
                    min={14}
                    max={50}
                    placeholder="21"
                    className="h-10 bg-white/[0.04]"
                    value={draft.ageMax ?? ""}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        ageMax: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Position</Label>
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
                <Label className="text-xs text-muted-foreground">Dominant foot</Label>
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
                <Label className="text-xs text-muted-foreground">Willing to travel</Label>
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
            </FilterSection>
          </div>
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
