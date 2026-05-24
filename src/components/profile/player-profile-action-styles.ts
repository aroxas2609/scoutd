import { cn } from "@/lib/utils";

/** Shared coach actions on player profile (Message / Save / Trial). */
export function profileActionClass(
  variant: "secondary" | "primary" | "saved" = "secondary"
) {
  return cn(
    "flex h-[4.25rem] w-full flex-col items-center justify-center gap-1.5 rounded-xl border px-2 text-xs font-medium transition-colors active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    variant === "primary" &&
      "border-[var(--accent-brand)]/30 bg-[var(--accent-brand)] text-[var(--primary-foreground)] hover:bg-[var(--accent-brand-muted)]",
    variant === "secondary" &&
      "border-white/[0.08] bg-[var(--bg-surface)] text-foreground hover:bg-white/[0.05]",
    variant === "saved" &&
      "border-[var(--accent-brand)]/35 bg-[var(--accent-brand)]/10 text-[var(--accent-brand)]"
  );
}
