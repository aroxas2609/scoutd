"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { BottomTabBar } from "./bottom-tab-bar";
import { PageContainer } from "./page-container";
import { fetchViewerRole } from "@/features/auth/use-viewer-role";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChatThread = /^\/messages\/[^/]+$/.test(pathname);
  const qc = useQueryClient();

  useEffect(() => {
    void qc.prefetchQuery({ queryKey: ["viewer-role"], queryFn: fetchViewerRole });
  }, [qc]);

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg-deep)]">
      <PageContainer
        as="main"
        className={isChatThread ? "flex-1 pb-32" : "flex-1 pb-20"}
      >
        {children}
      </PageContainer>
      {!isChatThread && <BottomTabBar />}
    </div>
  );
}
