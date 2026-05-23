"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CoachAgeGroupsDisplay } from "@/components/profile/coach-age-groups-display";
import { formatAgeGroupsCollapsedSummary } from "@/lib/football/age-groups";
import { cn } from "@/lib/utils";

type CoachAgeGroupsCardProps = {
  codes: string[];
  className?: string;
  /** Start expanded when only a few groups are selected */
  expandWhenFew?: number;
};

export function CoachAgeGroupsCard({
  codes,
  className,
  expandWhenFew = 5,
}: CoachAgeGroupsCardProps) {
  const [open, setOpen] = useState(codes.length <= expandWhenFew);
  const summary = formatAgeGroupsCollapsedSummary(codes);

  if (!codes.length) return null;

  return (
    <div
      className={cn(
        "mt-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-[var(--bg-surface)]",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-white/[0.02]"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Age groups
            </h3>
            <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
              {codes.length}
            </span>
          </div>
          {!open ? (
            <p className="mt-1.5 line-clamp-2 text-sm text-foreground/80">{summary}</p>
          ) : null}
        </div>
        <ChevronDown
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open ? (
        <div className="border-t border-white/[0.06] px-4 pb-4 pt-3">
          <CoachAgeGroupsDisplay codes={codes} />
        </div>
      ) : null}
    </div>
  );
}
