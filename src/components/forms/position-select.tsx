"use client";

import {
  FOOTBALL_POSITION_GROUPS,
  getPositionDisplayLabel,
  getPositionShortLabel,
} from "@/lib/football/positions";
import { SheetSelect, type SheetSelectGroup } from "@/components/forms/sheet-select";

const POSITION_GROUPS: SheetSelectGroup[] = FOOTBALL_POSITION_GROUPS.map(
  (group) => ({
    label: group.label,
    options: group.positions.map((position) => ({
      value: position,
      label: position,
      description: getPositionShortLabel(position),
      triggerLabel: getPositionDisplayLabel(position),
    })),
  })
);

type PositionSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  sheetTitle?: string;
  error?: boolean;
  className?: string;
  allowClear?: boolean;
  clearLabel?: string;
};

export function PositionSelect({
  value,
  onValueChange,
  placeholder = "Select position",
  sheetTitle = "Choose position",
  error,
  className,
  allowClear,
  clearLabel,
}: PositionSelectProps) {
  return (
    <SheetSelect
      value={value}
      onValueChange={onValueChange}
      groups={POSITION_GROUPS}
      placeholder={placeholder}
      sheetTitle={sheetTitle}
      error={error}
      className={className}
      allowClear={allowClear}
      clearLabel={clearLabel}
    />
  );
}

export { getPositionDisplayLabel, getPositionLabel } from "@/lib/football/positions";
