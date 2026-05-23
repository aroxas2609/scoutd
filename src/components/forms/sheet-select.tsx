"use client";

import { useMemo, useState, type MouseEvent } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useIsLgScreen } from "@/lib/use-media-query";

export type SheetSelectOption = {
  value: string;
  label: string;
  /** Shown as secondary text in the sheet list. */
  description?: string;
  /** Override text on the closed trigger (default: `label` or `label description`). */
  triggerLabel?: string;
};

export type SheetSelectGroup = {
  label: string;
  options: SheetSelectOption[];
};

export const sheetSelectTriggerClass =
  "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-white/5 px-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type SheetSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options?: SheetSelectOption[];
  groups?: SheetSelectGroup[];
  placeholder?: string;
  sheetTitle?: string;
  error?: boolean;
  className?: string;
  /** Show a row to clear the selection (e.g. filter “Any”). */
  allowClear?: boolean;
  clearLabel?: string;
};

function flattenOptions(
  options?: SheetSelectOption[],
  groups?: SheetSelectGroup[]
): SheetSelectOption[] {
  if (options?.length) return options;
  return groups?.flatMap((g) => g.options) ?? [];
}

function useSheetSelectState(
  value: string,
  options?: SheetSelectOption[],
  groups?: SheetSelectGroup[]
) {
  const allOptions = useMemo(() => flattenOptions(options, groups), [options, groups]);

  const selectedLabel = useMemo(() => {
    if (!value) return null;
    const option = allOptions.find((o) => o.value === value);
    if (!option) return value;
    if (option.triggerLabel) return option.triggerLabel;
    if (option.description) return `${option.label} ${option.description}`;
    return option.label;
  }, [value, allOptions]);

  return { allOptions, selectedLabel };
}

type SheetSelectPartsProps = SheetSelectProps & {
  selectedLabel: string | null;
};

function SheetSelectTriggerButton({
  selectedLabel,
  placeholder,
  error,
  className,
  sheetTitle,
  onClick,
}: {
  selectedLabel: string | null;
  placeholder: string;
  error?: boolean;
  className?: string;
  sheetTitle: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        sheetSelectTriggerClass,
        error && "border-red-400/50",
        !selectedLabel && "text-muted-foreground",
        className
      )}
      aria-label={sheetTitle}
    >
      <span className="truncate text-left">{selectedLabel ?? placeholder}</span>
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

/** Mobile: bottom sheet (unchanged). */
function SheetSelectMobile({
  value,
  onValueChange,
  options,
  groups,
  placeholder = "Select",
  sheetTitle = "Choose an option",
  error,
  className,
  allowClear,
  clearLabel = "Any",
  selectedLabel,
}: SheetSelectPartsProps) {
  const [open, setOpen] = useState(false);

  function select(next: string) {
    onValueChange(next);
    setOpen(false);
  }

  function renderOption(option: SheetSelectOption) {
    const selected = value === option.value;
    return (
      <li key={option.value}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            select(option.value);
          }}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
            selected
              ? "bg-[var(--accent-brand)]/15 text-foreground"
              : "hover:bg-white/[0.06] active:bg-white/[0.08]"
          )}
        >
          <span className="flex min-w-0 flex-1 items-center gap-3">
            {option.description ? (
              <>
                <span className="w-10 shrink-0 font-semibold tabular-nums">
                  {option.label}
                </span>
                <span className="truncate text-sm text-muted-foreground">
                  {option.description}
                </span>
              </>
            ) : (
              <span className="text-sm font-medium">{option.label}</span>
            )}
          </span>
          {selected ? (
            <Check className="h-4 w-4 shrink-0 text-[var(--accent-electric)]" />
          ) : null}
        </button>
      </li>
    );
  }

  return (
    <>
      <SheetSelectTriggerButton
        selectedLabel={selectedLabel}
        placeholder={placeholder}
        error={error}
        className={className}
        sheetTitle={sheetTitle}
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
      />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          showCloseButton
          className="flex max-h-[min(72dvh,520px)] flex-col gap-0 rounded-t-3xl border-white/10 bg-[var(--bg-graphite)] p-0"
        >
          <div className="flex shrink-0 justify-center pt-2">
            <div className="h-1 w-10 rounded-full bg-white/20" aria-hidden />
          </div>
          <SheetHeader className="shrink-0 border-b border-white/[0.06] px-4 pb-3 pt-1 text-left">
            <SheetTitle className="font-display text-lg">{sheetTitle}</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-2 pb-6">
            {allowClear ? (
              <ul className="border-b border-white/[0.06] py-2">
                <li>
                  <button
                    type="button"
                    onClick={() => select("")}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                      !value
                        ? "bg-[var(--accent-brand)]/15 font-medium"
                        : "text-muted-foreground hover:bg-white/[0.06]"
                    )}
                  >
                    {clearLabel}
                    {!value ? (
                      <Check className="h-4 w-4 text-[var(--accent-electric)]" />
                    ) : null}
                  </button>
                </li>
              </ul>
            ) : null}

            {groups?.length ? (
              groups.map((group) => (
                <div key={group.label} className="py-2">
                  <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </p>
                  <ul className="space-y-0.5">{group.options.map(renderOption)}</ul>
                </div>
              ))
            ) : (
              <ul className="space-y-0.5 py-2">{options?.map(renderOption)}</ul>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function DesktopSelectOption({
  option,
  selected,
  onSelect,
}: {
  option: SheetSelectOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <DropdownMenuItem
      className={cn(
        "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-foreground focus:bg-[var(--accent-brand)]/15 focus:text-foreground",
        selected && "bg-[var(--accent-brand)]/10"
      )}
      onClick={(e) => {
        e.preventDefault();
        onSelect();
      }}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2.5">
        {option.description ? (
          <>
            <span className="w-9 shrink-0 text-xs font-semibold tabular-nums">
              {option.label}
            </span>
            <span className="truncate text-sm text-muted-foreground">
              {option.description}
            </span>
          </>
        ) : (
          <span className="text-sm">{option.label}</span>
        )}
      </span>
      {selected ? (
        <Check className="h-4 w-4 shrink-0 text-[var(--accent-electric)]" />
      ) : null}
    </DropdownMenuItem>
  );
}

/** Desktop: anchored dropdown menu aligned to the trigger. */
function SheetSelectDesktop({
  value,
  onValueChange,
  options,
  groups,
  placeholder = "Select",
  sheetTitle = "Choose an option",
  error,
  className,
  allowClear,
  clearLabel = "Any",
  selectedLabel,
}: SheetSelectPartsProps) {
  const [open, setOpen] = useState(false);

  function select(next: string) {
    onValueChange(next);
    setOpen(false);
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className={cn(
          sheetSelectTriggerClass,
          error && "border-red-400/50",
          !selectedLabel && "text-muted-foreground",
          className
        )}
        aria-label={sheetTitle}
      >
        <span className="truncate text-left">{selectedLabel ?? placeholder}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="max-h-[min(20rem,70vh)] w-[var(--anchor-width)] min-w-[var(--anchor-width)] overflow-y-auto border border-white/10 bg-[var(--bg-graphite)] p-1.5 shadow-xl"
      >
        {allowClear ? (
          <>
            <DropdownMenuItem
              className={cn(
                "cursor-pointer rounded-lg px-2.5 py-2 text-sm focus:bg-[var(--accent-brand)]/15 focus:text-foreground",
                !value && "bg-[var(--accent-brand)]/10 font-medium"
              )}
              onClick={(e) => {
                e.preventDefault();
                select("");
              }}
            >
              <span className="flex flex-1 items-center justify-between gap-2">
                {clearLabel}
                {!value ? (
                  <Check className="h-4 w-4 text-[var(--accent-electric)]" />
                ) : null}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-white/10" />
          </>
        ) : null}

        {groups?.length ? (
          groups.map((group, index) => (
            <DropdownMenuGroup key={group.label}>
              {index > 0 ? <DropdownMenuSeparator className="my-1 bg-white/10" /> : null}
              <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </DropdownMenuLabel>
              {group.options.map((option) => (
                <DesktopSelectOption
                  key={option.value}
                  option={option}
                  selected={value === option.value}
                  onSelect={() => select(option.value)}
                />
              ))}
            </DropdownMenuGroup>
          ))
        ) : (
          options?.map((option) => (
            <DesktopSelectOption
              key={option.value}
              option={option}
              selected={value === option.value}
              onSelect={() => select(option.value)}
            />
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SheetSelect(props: SheetSelectProps) {
  const isLgScreen = useIsLgScreen();
  const { allOptions, selectedLabel } = useSheetSelectState(
    props.value,
    props.options,
    props.groups
  );

  const partsProps: SheetSelectPartsProps = {
    ...props,
    selectedLabel,
  };

  if (isLgScreen) {
    return <SheetSelectDesktop {...partsProps} />;
  }

  return <SheetSelectMobile {...partsProps} />;
}
