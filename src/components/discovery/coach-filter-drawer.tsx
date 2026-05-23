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
import { PremiumButton } from "@/components/ui/premium-button";
import type { CoachSearchFilters } from "@/types/database";

interface CoachFilterDrawerProps {
  filters: CoachSearchFilters;
  onChange: (filters: CoachSearchFilters) => void;
}

export function CoachFilterDrawer({ filters, onChange }: CoachFilterDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
        <SlidersHorizontal className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[70vh] rounded-t-3xl border-white/10 bg-[var(--bg-graphite)]"
      >
        <SheetHeader>
          <SheetTitle className="font-display text-xl">Filter clubs</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div>
            <Label>Location</Label>
            <Input
              className="mt-1 bg-white/5"
              placeholder="e.g. London"
              value={filters.location ?? ""}
              onChange={(e) =>
                onChange({ ...filters, location: e.target.value || undefined })
              }
            />
          </div>
          <div>
            <Label>League / division</Label>
            <Input
              className="mt-1 bg-white/5"
              placeholder="e.g. National League"
              value={filters.league ?? ""}
              onChange={(e) => onChange({ ...filters, league: e.target.value || undefined })}
            />
          </div>
          <PremiumButton className="w-full" onClick={() => onChange(filters)}>
            Apply filters
          </PremiumButton>
        </div>
      </SheetContent>
    </Sheet>
  );
}
