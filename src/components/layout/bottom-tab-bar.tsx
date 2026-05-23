"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Search,
  Bookmark,
  MessageCircle,
  Calendar,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnreadMessageCount } from "@/features/messaging/hooks";
import { useIsCoachViewer } from "@/features/auth/use-viewer-role";

const tabs = [
  { href: "/discover", label: "Discover", playerLabel: "Clubs", icon: Compass },
  { href: "/search", label: "Search", playerLabel: "Find", icon: Search },
  { href: "/shortlist", label: "Saved", icon: Bookmark, coachOnly: true },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/trials", label: "Trials", icon: Calendar },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const { isPlayer, isCoach } = useIsCoachViewer();
  const { data: unreadMessages = 0 } = useUnreadMessageCount();

  const visibleTabs = tabs.filter((tab) => !tab.coachOnly || isCoach);
  const compact = visibleTabs.length > 5;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/[0.06] bg-[var(--bg-deep)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-0.5">
        {visibleTabs.map(({ href, label, playerLabel, icon: Icon }) => {
          const tabLabel = isPlayer && playerLabel ? playerLabel : label;
          const active = pathname.startsWith(href);
          const showBadge = href === "/messages" && unreadMessages > 0;

          return (
            <Link
              key={href}
              href={href}
              prefetch
              className={cn(
                "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2.5 font-medium transition-colors",
                compact ? "text-[10px]" : "text-[11px]",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                  active && "bg-white/[0.08]"
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.25 : 2} />
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
