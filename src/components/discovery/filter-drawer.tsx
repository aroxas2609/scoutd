"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PremiumButton } from "@/components/ui/premium-button";
import type { PlayerSearchFilters } from "@/types/database";

const POSITIONS = ["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST"];

interface FilterDrawerProps {
  filters: PlayerSearchFilters;
  onChange: (filters: PlayerSearchFilters) => void;
}

export function FilterDrawer({ filters, onChange }: FilterDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
        <SlidersHorizontal className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-3xl border-white/10 bg-[var(--bg-graphite)]"
      >
        <SheetHeader>
          <SheetTitle className="font-display text-xl">Filters</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6 overflow-y-auto pb-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Min age</Label>
              <Input
                type="number"
                className="mt-1 bg-white/5"
                value={filters.ageMin ?? ""}
                onChange={(e) =>
                  onChange({ ...filters, ageMin: Number(e.target.value) || undefined })
                }
              />
            </div>
            <div>
              <Label>Max age</Label>
              <Input
                type="number"
                className="mt-1 bg-white/5"
                value={filters.ageMax ?? ""}
                onChange={(e) =>
                  onChange({ ...filters, ageMax: Number(e.target.value) || undefined })
                }
              />
            </div>
          </div>
          <div>
            <Label>Position</Label>
            <Select
              value={filters.position ?? ""}
              onValueChange={(v) => onChange({ ...filters, position: v || undefined })}
            >
              <SelectTrigger className="mt-1 bg-white/5">
                <SelectValue placeholder="Any position" />
              </SelectTrigger>
              <SelectContent>
                {POSITIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Dominant foot</Label>
            <Select
              value={filters.foot ?? ""}
              onValueChange={(v) =>
                onChange({
                  ...filters,
                  foot: (v as PlayerSearchFilters["foot"]) || undefined,
                })
              }
            >
              <SelectTrigger className="mt-1 bg-white/5">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label>Willing to travel</Label>
            <Switch
              checked={filters.willingToTravel ?? false}
              onCheckedChange={(c) => onChange({ ...filters, willingToTravel: c })}
            />
          </div>
          <PremiumButton
            className="w-full"
            onClick={() => onChange(filters)}
          >
            Apply filters
          </PremiumButton>
        </div>
      </SheetContent>
    </Sheet>
  );
}
