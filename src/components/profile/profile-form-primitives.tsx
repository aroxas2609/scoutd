"use client";

import { Label } from "@/components/ui/label";
import { SheetSelect, type SheetSelectOption } from "@/components/forms/sheet-select";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { cn } from "@/lib/utils";

export const profileFieldClass =
  "h-11 rounded-xl border-white/10 bg-[var(--bg-deep)]";

export const profileTextareaClass =
  "min-h-[100px] resize-none rounded-xl border-white/10 bg-[var(--bg-deep)]";

export function ProfileFormSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-2", className)}>
      <h3 className="px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-[var(--bg-surface)] p-3">
        {children}
      </div>
    </section>
  );
}

export function ProfileFormField({
  label,
  labelExtra,
  hint,
  error,
  children,
}: {
  label: string;
  labelExtra?: React.ReactNode;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        {labelExtra}
      </div>
      {children}
      {hint && !error ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}

type SelectOption = { value: string; label: string };

export function ProfileFormSelect({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Select",
  sheetTitle,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  sheetTitle?: string;
}) {
  const sheetOptions: SheetSelectOption[] = options.map((o) => ({
    value: o.value,
    label: o.label,
  }));

  return (
    <ProfileFormField label={label}>
      <SheetSelect
        value={value}
        onValueChange={onValueChange}
        options={sheetOptions}
        placeholder={placeholder}
        sheetTitle={sheetTitle ?? label}
        className={cn(profileFieldClass, "h-11")}
      />
    </ProfileFormField>
  );
}

export function ProfileFormYesNo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <ProfileFormField label={label}>
      <SegmentedControl
        segments={[
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ]}
        value={value ? "yes" : "no"}
        onChange={(v) => onChange(v === "yes")}
      />
    </ProfileFormField>
  );
}
