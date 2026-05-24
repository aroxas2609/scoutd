import { cn } from "@/lib/utils";
import type { AvailabilityStatus } from "@/types/database";

const labels: Record<AvailabilityStatus, string> = {
  available: "Available",
  open_to_offers: "Open to offers",
  not_available: "Unavailable",
};

const styles: Record<AvailabilityStatus, string> = {
  available:
    "border-[var(--success)]/25 bg-[var(--success)]/15 text-[#a7f3d0]",
  open_to_offers:
    "border-[var(--accent-blue)]/20 bg-[var(--accent-blue)]/10 text-[var(--text-secondary)]",
  not_available:
    "border-white/[0.08] bg-white/[0.04] text-muted-foreground",
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
