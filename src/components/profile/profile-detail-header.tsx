import { cn } from "@/lib/utils";

/** Sticky header for profile detail screens — respects mobile safe area (notch / status bar). */
export function ProfileDetailHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky top-0 z-40 flex items-center justify-between border-b border-white/[0.06] bg-[var(--bg-deep)]/90 px-4 pb-3 backdrop-blur-md",
        "pt-[max(0.75rem,env(safe-area-inset-top))] lg:px-6 lg:pb-3 lg:pt-3",
        className
      )}
    >
      {children}
    </div>
  );
}
