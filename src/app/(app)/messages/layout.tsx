"use client";

import { MessagesInboxPanel } from "@/components/messaging/messages-inbox-panel";

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col lg:-mx-6 lg:min-h-[calc(100dvh-4rem)] lg:overflow-hidden xl:-mx-8">
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:overflow-hidden lg:rounded-2xl lg:border lg:border-white/[0.08] lg:bg-[var(--bg-surface)]/30">
        <div className="hidden lg:flex lg:w-80 lg:shrink-0 lg:flex-col lg:overflow-hidden">
          <MessagesInboxPanel variant="sidebar" />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
