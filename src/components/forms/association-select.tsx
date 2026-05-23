"use client";

import { useMemo } from "react";
import { SheetSelect } from "@/components/forms/sheet-select";
import { useAssociations } from "@/features/associations/hooks";
import {
  associationNameFromId,
  associationIdFromLeagueName,
} from "@/lib/football/resolve-association";
import { getMetroAssociationOptions } from "@/lib/football/metro-nsw-associations";

type AssociationSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
  allowClear?: boolean;
  clearLabel?: string;
  /** Coach forms use association name (league); player forms use association UUID */
  valueMode?: "name" | "id";
};

export function AssociationSelect({
  value,
  onValueChange,
  placeholder = "Select association",
  error,
  className,
  allowClear = true,
  clearLabel = "No association",
  valueMode = "name",
}: AssociationSelectProps) {
  const { data: associations = [], isPending } = useAssociations();

  const idOptions = useMemo(() => {
    if (associations.length > 0) {
      return associations.map((a) => ({ value: a.id, label: a.name }));
    }
    return getMetroAssociationOptions(valueMode === "name" ? value : undefined).map(
      (o) => ({ value: o.value, label: o.label })
    );
  }, [associations, value, valueMode]);

  const selectValue = useMemo(() => {
    if (valueMode === "id") return value;
    if (!value) return "";
    if (associations.length > 0) {
      return associationIdFromLeagueName(value, associations) ?? value;
    }
    return value;
  }, [value, valueMode, associations]);

  function handleChange(selected: string) {
    if (!selected) {
      onValueChange("");
      return;
    }
    if (valueMode === "id") {
      onValueChange(selected);
      return;
    }
    const name =
      associations.length > 0
        ? associationNameFromId(selected, associations) ?? selected
        : selected;
    onValueChange(name);
  }

  return (
    <SheetSelect
      value={selectValue}
      onValueChange={handleChange}
      options={idOptions}
      placeholder={isPending ? "Loading…" : placeholder}
      sheetTitle="Association"
      error={error}
      className={className}
      allowClear={allowClear}
      clearLabel={clearLabel}
    />
  );
}
