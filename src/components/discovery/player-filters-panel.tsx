"use client";

import { UserRound, type LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SheetSelect } from "@/components/forms/sheet-select";
import { PositionSelect } from "@/components/forms/position-select";
import { DOMINANT_FOOT_OPTIONS } from "@/lib/form-options";
import type { PlayerSearchFilters } from "@/types/database";
import type { DrawerFilterState } from "@/components/discovery/filter-drawer";
import type { ReactNode } from "react";

export function countActivePlayerFilters(filters: PlayerSearchFilters | DrawerFilterState) {
  let n = 0;
  if (filters.position) n++;
  if (filters.foot) n++;
  if (filters.ageMin != null) n++;
  if (filters.ageMax != null) n++;
  if (filters.willingToTravel !== undefined) n++;
  if (filters.gender) n++;
  return n;
}

function FilterSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
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

type PlayerFiltersPanelProps = {
  filters: DrawerFilterState;
  onChange: (filters: DrawerFilterState) => void;
};

export function PlayerFiltersPanel({ filters, onChange }: PlayerFiltersPanelProps) {
  const setDraft = onChange;

  return (
    <div className="space-y-6">
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
            value={filters.gender ?? "any"}
            onChange={(v) =>
              setDraft({
                ...filters,
                gender: v === "any" ? undefined : v,
              })
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
              value={filters.ageMin ?? ""}
              onChange={(e) =>
                setDraft({
                  ...filters,
                  ageMin: e.target.value ? Number(e.target.value) : undefined,
                })
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
              value={filters.ageMax ?? ""}
              onChange={(e) =>
                setDraft({
                  ...filters,
                  ageMax: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Position</Label>
          <PositionSelect
            value={filters.position ?? ""}
            onValueChange={(v) => setDraft({ ...filters, position: v || undefined })}
            placeholder="Any position"
            allowClear
            clearLabel="Any position"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Dominant foot</Label>
          <SheetSelect
            value={filters.foot ?? ""}
            onValueChange={(v) =>
              setDraft({
                ...filters,
                foot: (v as PlayerSearchFilters["foot"]) || undefined,
              })
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
              filters.willingToTravel === true
                ? "yes"
                : filters.willingToTravel === false
                  ? "no"
                  : "any"
            }
            onChange={(v) =>
              setDraft({
                ...filters,
                willingToTravel: v === "yes" ? true : v === "no" ? false : undefined,
              })
            }
          />
        </div>
      </FilterSection>
    </div>
  );
}
