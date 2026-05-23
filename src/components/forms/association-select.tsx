"use client";

import { useMemo } from "react";
import { SheetSelect } from "@/components/forms/sheet-select";
import { getMetroAssociationOptions } from "@/lib/football/metro-nsw-associations";

type AssociationSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
  allowClear?: boolean;
  clearLabel?: string;
};

export function AssociationSelect({
  value,
  onValueChange,
  placeholder = "Select association",
  error,
  className,
  allowClear = true,
  clearLabel = "No association",
}: AssociationSelectProps) {
  const options = useMemo(() => getMetroAssociationOptions(value), [value]);

  return (
    <SheetSelect
      value={value}
      onValueChange={onValueChange}
      options={options}
      placeholder={placeholder}
      sheetTitle="Association"
      error={error}
      className={className}
      allowClear={allowClear}
      clearLabel={clearLabel}
    />
  );
}
