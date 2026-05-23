import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerificationBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground",
        className
      )}
      title="Verified"
    >
      <BadgeCheck className="h-3 w-3 text-[var(--accent-brand)]" />
    </span>
  );
}
