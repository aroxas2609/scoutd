"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  AGE_GROUP_CATEGORIES,
  AGE_GROUPS,
  AGE_GROUP_CODES,
  formatAgeGroupsTriggerLabel,
  sortAgeGroupCodes,
} from "@/lib/football/age-groups";
import { sheetSelectTriggerClass } from "@/components/forms/sheet-select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type AgeGroupsSelectProps = {
  value: string[];
  onChange: (codes: string[]) => void;
  error?: boolean;
  className?: string;
};

export function AgeGroupsSelect({
  value,
  onChange,
  error,
  className,
}: AgeGroupsSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => sortAgeGroupCodes(value), [value]);
  const triggerLabel = formatAgeGroupsTriggerLabel(selected);
  const allSelected = selected.length === AGE_GROUP_CODES.length;

  function toggle(code: string) {
    if (selected.includes(code)) {
      onChange(selected.filter((c) => c !== code));
      return;
    }
    onChange(sortAgeGroupCodes([...selected, code]));
  }

  function selectAll() {
    onChange([...AGE_GROUP_CODES]);
  }

  function clearAll() {
    onChange([]);
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
        className={cn(
          sheetSelectTriggerClass,
          error && "border-red-400/50",
          !triggerLabel && "text-muted-foreground",
          className
        )}
      >
        <span className="truncate text-left">
          {triggerLabel ?? "Select age groups"}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          showCloseButton
          className="flex max-h-[min(80dvh,560px)] flex-col gap-0 rounded-t-3xl border-white/10 bg-[var(--bg-graphite)] p-0"
        >
          <div className="flex shrink-0 justify-center pt-2">
            <div className="h-1 w-10 rounded-full bg-white/20" aria-hidden />
          </div>
          <SheetHeader className="shrink-0 border-b border-white/[0.06] px-4 pb-3 pt-1 text-left">
            <SheetTitle className="font-display text-lg">Age groups</SheetTitle>
            <p className="text-sm text-muted-foreground">
              {selected.length} selected
            </p>
          </SheetHeader>

          <div className="flex shrink-0 gap-2 border-b border-white/[0.06] px-4 py-3">
            <button
              type="button"
              onClick={selectAll}
              disabled={allSelected}
              className={cn(
                "flex-1 rounded-lg border border-white/10 py-2 text-sm font-medium transition-colors",
                allSelected
                  ? "text-muted-foreground opacity-50"
                  : "hover:bg-white/[0.06]"
              )}
            >
              Select all
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={selected.length === 0}
              className={cn(
                "flex-1 rounded-lg border border-white/10 py-2 text-sm font-medium transition-colors",
                selected.length === 0
                  ? "text-muted-foreground opacity-50"
                  : "hover:bg-white/[0.06]"
              )}
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900"
            >
              Done
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-2 pb-6">
            {AGE_GROUP_CATEGORIES.map((category) => {
              const groups = AGE_GROUPS.filter((g) => g.category === category);
              return (
                <div key={category} className="py-2">
                  <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {category}
                  </p>
                  <ul className="space-y-0.5">
                    {groups.map((group) => {
                      const isSelected = selected.includes(group.code);
                      return (
                        <li key={group.code}>
                          <button
                            type="button"
                            onClick={() => toggle(group.code)}
                            className={cn(
                              "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                              isSelected
                                ? "bg-[var(--accent-brand)]/15"
                                : "hover:bg-white/[0.06] active:bg-white/[0.08]"
                            )}
                          >
                            <span className="flex min-w-0 items-center gap-3">
                              <span
                                className={cn(
                                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                                  isSelected
                                    ? "border-[var(--accent-electric)] bg-[var(--accent-electric)]/20"
                                    : "border-white/20"
                                )}
                              >
                                {isSelected ? (
                                  <Check className="h-3 w-3 text-[var(--accent-electric)]" />
                                ) : null}
                              </span>
                              <span className="w-10 shrink-0 font-semibold tabular-nums">
                                {group.code}
                              </span>
                              <span className="truncate text-sm text-muted-foreground">
                                {group.label}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
