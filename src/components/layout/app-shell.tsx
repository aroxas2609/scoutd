"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { BottomTabBar } from "./bottom-tab-bar";
import { DesktopSidebar } from "./desktop-sidebar";
import { PageContainer } from "./page-container";
import { fetchViewerRole } from "@/features/auth/use-viewer-role";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChatThread = /^\/messages\/[^/]+$/.test(pathname);
  const isMessagesRoute = pathname.startsWith("/messages");
  const qc = useQueryClient();

  useEffect(() => {
    void qc.prefetchQuery({ queryKey: ["viewer-role"], queryFn: fetchViewerRole });
  }, [qc]);

  const mainPadding = cn(
    "flex-1",
    isChatThread ? "pb-32 lg:pb-0" : "pb-20 lg:pb-6",
    isMessagesRoute && "lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-hidden"
  );

  return (
    <div className="flex min-h-dvh bg-[var(--bg-deep)]">
      <DesktopSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <PageContainer as="main" className={mainPadding}>
          {children}
        </PageContainer>
        {!isChatThread && <BottomTabBar />}
      </div>
    </div>
  );
}
