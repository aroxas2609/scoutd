import { cn } from "@/lib/utils";
import type { AvailabilityStatus } from "@/types/database";

const labels: Record<AvailabilityStatus, string> = {
  available: "Available",
  open_to_offers: "Open to offers",
  not_available: "Unavailable",
};

const styles: Record<AvailabilityStatus, string> = {
  available: "bg-emerald-500/10 text-emerald-300/90 border-emerald-500/20",
  open_to_offers: "bg-white/[0.06] text-foreground border-white/[0.1]",
  not_available: "bg-white/[0.04] text-muted-foreground border-white/[0.08]",
};

export function AvailabilityBadge({ status }: { status: AvailabilityStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium",
        styles[status]
      )}
    >
      {labels[status]}
    </span>
  );
}
