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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useIsLgScreen } from "@/lib/use-media-query";

type AgeGroupsSelectProps = {
  value: string[];
  onChange: (codes: string[]) => void;
  error?: boolean;
  className?: string;
};

function AgeGroupsToolbar({
  selectedCount,
  allSelected,
  onSelectAll,
  onClearAll,
  onDone,
  variant,
}: {
  selectedCount: number;
  allSelected: boolean;
  onSelectAll: () => void;
  onClearAll: () => void;
  onDone: () => void;
  variant: "sheet" | "dropdown";
}) {
  const isDesktop = variant === "dropdown";

  return (
    <div
      className={cn(
        "shrink-0 border-b border-white/[0.06]",
        isDesktop ? "flex flex-wrap items-center gap-2 px-3 py-2.5" : "flex gap-2 px-4 py-3"
      )}
    >
      <button
        type="button"
        onClick={onSelectAll}
        disabled={allSelected}
        className={cn(
          "rounded-lg border border-white/10 font-medium transition-colors",
          isDesktop
            ? "px-2.5 py-1 text-xs hover:bg-white/[0.06] disabled:opacity-50"
            : "flex-1 py-2 text-sm",
          allSelected && !isDesktop && "text-muted-foreground opacity-50",
          allSelected && isDesktop && "text-muted-foreground",
          !allSelected && !isDesktop && "hover:bg-white/[0.06]"
        )}
      >
        Select all
      </button>
      <button
        type="button"
        onClick={onClearAll}
        disabled={selectedCount === 0}
        className={cn(
          "rounded-lg border border-white/10 font-medium transition-colors",
          isDesktop
            ? "px-2.5 py-1 text-xs hover:bg-white/[0.06] disabled:opacity-50"
            : "flex-1 py-2 text-sm",
          selectedCount === 0 && !isDesktop && "text-muted-foreground opacity-50",
          selectedCount === 0 && isDesktop && "text-muted-foreground",
          selectedCount > 0 && !isDesktop && "hover:bg-white/[0.06]"
        )}
      >
        Clear all
      </button>
      <button
        type="button"
        onClick={onDone}
        className={cn(
          "rounded-lg bg-[var(--accent-brand)] font-medium text-[var(--primary-foreground)]",
          isDesktop ? "ml-auto px-3 py-1 text-xs" : "px-4 py-2 text-sm"
        )}
      >
        Done
      </button>
    </div>
  );
}

function AgeGroupsList({
  selected,
  onToggle,
  variant,
}: {
  selected: string[];
  onToggle: (code: string) => void;
  variant: "sheet" | "dropdown";
}) {
  const isDesktop = variant === "dropdown";

  return (
    <div
      className={cn(
        "min-h-0 flex-1 overflow-y-auto overscroll-y-contain",
        isDesktop ? "max-h-[min(18rem,50vh)] p-1.5" : "px-2 pb-6"
      )}
    >
      {AGE_GROUP_CATEGORIES.map((category) => {
        const groups = AGE_GROUPS.filter((g) => g.category === category);
        if (isDesktop) {
          return (
            <DropdownMenuGroup key={category}>
              <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {category}
              </DropdownMenuLabel>
              {groups.map((group) => {
                const isSelected = selected.includes(group.code);
                return (
                  <DropdownMenuCheckboxItem
                    key={group.code}
                    checked={isSelected}
                    onCheckedChange={() => onToggle(group.code)}
                    className="cursor-pointer gap-2.5 py-2 pl-2 pr-8 focus:bg-[var(--accent-brand)]/15 focus:text-foreground"
                    onClick={(e) => e.preventDefault()}
                  >
                    <span className="w-9 shrink-0 font-semibold tabular-nums">
                      {group.code}
                    </span>
                    <span className="truncate text-muted-foreground">{group.label}</span>
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuGroup>
          );
        }
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
                      onClick={() => onToggle(group.code)}
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
  );
}

function AgeGroupsSelectTrigger({
  triggerLabel,
  error,
  className,
  onClick,
}: {
  triggerLabel: string | null;
  error?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      className={cn(
        sheetSelectTriggerClass,
        error && "border-red-400/50",
        !triggerLabel && "text-muted-foreground",
        className
      )}
    >
      <span className="truncate text-left">{triggerLabel ?? "Select age groups"}</span>
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

function AgeGroupsSelectMobile({
  open,
  onOpenChange,
  selected,
  onToggle,
  onSelectAll,
  onClearAll,
  allSelected,
  triggerLabel,
  error,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: string[];
  onToggle: (code: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  allSelected: boolean;
  triggerLabel: string | null;
  error?: boolean;
  className?: string;
}) {
  return (
    <>
      <AgeGroupsSelectTrigger
        triggerLabel={triggerLabel}
        error={error}
        className={className}
        onClick={() => onOpenChange(true)}
      />
      <Sheet open={open} onOpenChange={onOpenChange}>
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
            <p className="text-sm text-muted-foreground">{selected.length} selected</p>
          </SheetHeader>
          <AgeGroupsToolbar
            selectedCount={selected.length}
            allSelected={allSelected}
            onSelectAll={onSelectAll}
            onClearAll={onClearAll}
            onDone={() => onOpenChange(false)}
            variant="sheet"
          />
          <AgeGroupsList selected={selected} onToggle={onToggle} variant="sheet" />
        </SheetContent>
      </Sheet>
    </>
  );
}

function AgeGroupsSelectDesktop({
  open,
  onOpenChange,
  selected,
  onToggle,
  onSelectAll,
  onClearAll,
  allSelected,
  triggerLabel,
  error,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: string[];
  onToggle: (code: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  allSelected: boolean;
  triggerLabel: string | null;
  error?: boolean;
  className?: string;
}) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger
        className={cn(
          sheetSelectTriggerClass,
          error && "border-red-400/50",
          !triggerLabel && "text-muted-foreground",
          className
        )}
      >
        <span className="truncate text-left">{triggerLabel ?? "Select age groups"}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="flex w-[var(--anchor-width)] min-w-[20rem] max-w-md flex-col overflow-hidden border border-white/10 bg-[var(--bg-graphite)] p-0 shadow-xl"
      >
        <div className="border-b border-white/[0.06] px-3 py-2.5">
          <p className="font-display text-sm font-semibold">Age groups</p>
          <p className="text-xs text-muted-foreground">{selected.length} selected</p>
        </div>
        <AgeGroupsToolbar
          selectedCount={selected.length}
          allSelected={allSelected}
          onSelectAll={onSelectAll}
          onClearAll={onClearAll}
          onDone={() => onOpenChange(false)}
          variant="dropdown"
        />
        <AgeGroupsList selected={selected} onToggle={onToggle} variant="dropdown" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AgeGroupsSelect({
  value,
  onChange,
  error,
  className,
}: AgeGroupsSelectProps) {
  const [open, setOpen] = useState(false);
  const isLgScreen = useIsLgScreen();
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

  const shared = {
    open,
    onOpenChange: setOpen,
    selected,
    onToggle: toggle,
    onSelectAll: selectAll,
    onClearAll: clearAll,
    allSelected,
    triggerLabel,
    error,
    className,
  };

  if (isLgScreen) {
    return <AgeGroupsSelectDesktop {...shared} />;
  }

  return <AgeGroupsSelectMobile {...shared} />;
}
