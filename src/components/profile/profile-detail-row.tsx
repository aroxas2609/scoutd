import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileDetailRow({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon?: LucideIcon;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  if (value == null || value === "") return null;

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-white/[0.06] py-3 last:border-0",
        "lg:flex-col lg:items-start lg:gap-1 lg:py-4",
        className
      )}
    >
      <span className="flex items-center gap-2 text-sm text-muted-foreground lg:text-xs">
        {Icon ? <Icon className="h-4 w-4 shrink-0 opacity-70" /> : null}
        {label}
      </span>
      <span className="max-w-[58%] text-right text-sm font-medium text-foreground lg:max-w-none lg:text-left lg:text-base">
        {value}
      </span>
    </div>
  );
}

export function ProfileSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-white/[0.08] bg-[var(--bg-surface)] px-4", className)}>
      <h3 className="border-b border-white/[0.06] py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div>{children}</div>
    </section>
  );
}
