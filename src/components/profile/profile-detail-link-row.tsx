import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileDetailLinkRow({
  icon: Icon,
  label,
  href,
  value,
  className,
}: {
  icon: LucideIcon;
  label: string;
  href: string;
  value: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center justify-between gap-4 border-b border-white/[0.06] py-3.5 transition-colors last:border-0 hover:bg-white/[0.02]",
        className
      )}
    >
      <span className="flex shrink-0 items-center gap-2.5 text-sm text-muted-foreground">
        <Icon className="h-4 w-4 opacity-70" />
        {label}
      </span>
      <span className="min-w-0 truncate text-right text-sm font-medium text-[var(--accent-brand)]">
        {value}
      </span>
    </Link>
  );
}
