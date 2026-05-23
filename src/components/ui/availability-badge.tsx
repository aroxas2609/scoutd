import { cn } from "@/lib/utils";
import type { AvailabilityStatus } from "@/types/database";

const labels: Record<AvailabilityStatus, string> = {
  available: "Available",
  open_to_offers: "Open to offers",
  not_available: "Unavailable",
};

const styles: Record<AvailabilityStatus, string> = {
  available:
    "bg-emerald-500/15 text-emerald-200/95 border-emerald-500/15 lg:bg-emerald-500/10 lg:text-emerald-300/90 lg:border-emerald-500/20",
  open_to_offers:
    "bg-white/[0.05] text-white/80 border-white/[0.08] lg:bg-white/[0.06] lg:text-foreground lg:border-white/[0.1]",
  not_available:
    "bg-white/[0.04] text-white/45 border-white/[0.06] lg:text-muted-foreground lg:border-white/[0.08]",
};

export function AvailabilityBadge({
  status,
  className,
}: {
  status: AvailabilityStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-none lg:rounded-lg lg:px-2 lg:py-0.5 lg:text-xs",
        styles[status],
        className
      )}
    >
      {labels[status]}
    </span>
  );
}
