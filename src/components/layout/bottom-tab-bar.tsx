"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useIsCoachViewer } from "@/features/auth/use-viewer-role";
import { appNavTabs, getTabLabel } from "@/components/layout/app-nav-tabs";
import { prefetchAppTabRoute } from "@/features/navigation/prefetch-app-tabs";

export function BottomTabBar({
  className,
  unreadMessages = 0,
}: {
  className?: string;
  unreadMessages?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const qc = useQueryClient();
  const { isPlayer, isCoach, role, userId } = useIsCoachViewer();

  function warmTab(href: string) {
    router.prefetch(href);
    if (userId) {
      prefetchAppTabRoute(qc, href, { userId, role });
    }
  }

  const visibleTabs = appNavTabs.filter((tab) => !tab.coachOnly || isCoach);
  const compact = visibleTabs.length > 5;

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[100] border-t border-white/[0.06] bg-[var(--bg-deep)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden",
        className
      )}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-0.5">
        {visibleTabs.map((tab) => {
          const tabLabel = getTabLabel(tab, { isPlayer, isCoach });
          const active = pathname.startsWith(tab.href);
          const showBadge = tab.href === "/messages" && unreadMessages > 0;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              prefetch
              onTouchStart={() => warmTab(tab.href)}
              onMouseEnter={() => warmTab(tab.href)}
              className={cn(
                "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2.5 font-medium transition-colors",
                compact ? "text-[10px]" : "text-[11px]",
                active ? "text-[var(--accent-brand)]" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "relative flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                  active &&
                    "bg-[var(--accent-brand)]/12 ring-1 ring-[var(--accent-brand)]/25"
                )}
              >
                <Icon
                  className={cn(
                    "h-[18px] w-[18px]",
                    !active && "opacity-75"
                  )}
                  strokeWidth={active ? 2.25 : 1.75}
                />
                {showBadge ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent-brand)] px-1 text-[9px] font-semibold text-[var(--primary-foreground)]">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                ) : null}
              </span>
              <span className="truncate px-0.5">{tabLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
