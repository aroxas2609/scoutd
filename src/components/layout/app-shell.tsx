"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { BottomTabBar } from "./bottom-tab-bar";
import { DesktopSidebar } from "./desktop-sidebar";
import { PageContainer } from "./page-container";
import {
  AUTH_USER_ID_KEY,
  viewerRoleQueryKey,
} from "@/features/auth/auth-query-cache";
import {
  fetchAuthUserId,
  fetchViewerRole,
} from "@/features/auth/use-viewer-role";
import { useUnreadMessageCount } from "@/features/messaging/hooks";
import { prefetchAppTabs } from "@/features/navigation/prefetch-app-tabs";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChatThread = /^\/messages\/[^/]+$/.test(pathname);
  const isMessagesRoute = pathname.startsWith("/messages");
  const qc = useQueryClient();
  const { data: unreadMessages = 0 } = useUnreadMessageCount();

  useEffect(() => {
    void qc
      .ensureQueryData({ queryKey: AUTH_USER_ID_KEY, queryFn: fetchAuthUserId })
      .then(async (userId) => {
        if (!userId) return;

        const viewer = await qc.ensureQueryData({
          queryKey: viewerRoleQueryKey(userId),
          queryFn: fetchViewerRole,
        });

        const schedulePrefetch = () => {
          prefetchAppTabs(qc, {
            userId,
            role: viewer?.role ?? null,
          });
        };

        if (typeof requestIdleCallback === "function") {
          requestIdleCallback(schedulePrefetch, { timeout: 3000 });
        } else {
          window.setTimeout(schedulePrefetch, 2000);
        }
      });
  }, [qc]);

  const mainPadding = cn(
    "flex-1",
    isChatThread ? "overflow-hidden pb-0 lg:overflow-visible" : "pb-20 lg:pb-6",
    isMessagesRoute && "lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-hidden"
  );

  return (
    <div className="flex min-h-dvh bg-[var(--bg-deep)]">
      <DesktopSidebar unreadMessages={unreadMessages} />
      <div className="flex min-w-0 flex-1 flex-col">
        <PageContainer as="main" className={mainPadding}>
          {children}
        </PageContainer>
        {!isChatThread && <BottomTabBar unreadMessages={unreadMessages} />}
      </div>
    </div>
  );
}
