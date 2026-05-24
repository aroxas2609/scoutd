"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useIsCoachViewer } from "@/features/auth/use-viewer-role";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { appNavTabs, getTabLabel } from "@/components/layout/app-nav-tabs";
import { prefetchAppTabRoute } from "@/features/navigation/prefetch-app-tabs";

export function DesktopSidebar({ unreadMessages = 0 }: { unreadMessages?: number }) {
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

  return (
    <aside className="hidden lg:flex lg:w-60 lg:shrink-0 lg:flex-col lg:border-r lg:border-white/[0.06] lg:bg-[var(--bg-deep)]">
      <div className="flex items-center justify-between gap-2 px-5 py-5">
        <Link href="/search" className="font-display text-xl font-bold tracking-tight">
          Scoutd
        </Link>
        <NotificationDropdown />
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2" aria-label="Main">
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
              onMouseEnter={() => warmTab(tab.href)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/[0.08] text-foreground"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
              )}
            >
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.25 : 2} />
                {showBadge ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent-brand)] px-1 text-[9px] font-semibold text-[var(--primary-foreground)]">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                ) : null}
              </span>
              {tabLabel}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
