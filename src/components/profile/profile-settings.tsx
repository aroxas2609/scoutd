"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileAccountSection({
  title = "Account",
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mt-8", className)}>
      <h3 className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export function ProfileSettingsCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/[0.08] bg-[var(--bg-surface)]",
        className
      )}
    >
      {children}
    </div>
  );
}

type ProfileSettingsRowProps = {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  chevron?: "right" | "down" | "none";
  expanded?: boolean;
  iconClassName?: string;
  destructive?: boolean;
  className?: string;
};

export function ProfileSettingsRow({
  icon: Icon,
  label,
  href,
  onClick,
  type = "button",
  chevron = "right",
  expanded,
  iconClassName,
  destructive,
  className,
}: ProfileSettingsRowProps) {
  const content = (
    <>
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]",
          destructive && "border-red-500/20 bg-red-500/10"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4",
            destructive ? "text-red-400" : "text-[var(--accent-brand)]",
            iconClassName
          )}
        />
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 text-left text-sm font-medium",
          destructive ? "text-red-300" : "text-foreground"
        )}
      >
        {label}
      </span>
      {chevron === "right" ? (
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      ) : null}
      {chevron === "down" ? (
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      ) : null}
    </>
  );

  const rowClass = cn(
    "flex w-full items-center gap-3 px-4 py-3.5 transition-colors",
    "hover:bg-white/[0.03] active:bg-white/[0.05]",
    className
  );

  if (href) {
    return (
      <Link href={href} className={rowClass}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={rowClass}>
      {content}
    </button>
  );
}

export function ProfileSettingsDivider() {
  return <div className="h-px bg-white/[0.06]" role="separator" />;
}

export function ProfileSettingsPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-white/[0.06] bg-[var(--bg-deep)]/40 px-4 py-4">
      {children}
    </div>
  );
}
