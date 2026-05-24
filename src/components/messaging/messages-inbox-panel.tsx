"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import {
  useConversations,
  useMessagingInboxRealtime,
  type ConversationInboxFilter,
} from "@/features/messaging/hooks";
import { MessagesEmptyState } from "@/components/messaging/messages-empty-state";
import { ConversationListItem } from "@/components/messaging/conversation-list-item";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { PageLoader } from "@/components/ui/page-loader";
import { useViewerRole } from "@/features/auth/use-viewer-role";
import { cn } from "@/lib/utils";

type MessagesInboxPanelProps = {
  /** Desktop sidebar: omit app-level header */
  variant?: "page" | "sidebar";
};

export function MessagesInboxPanel({ variant = "page" }: MessagesInboxPanelProps) {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [inboxFilter, setInboxFilter] = useState<ConversationInboxFilter>("active");
  useMessagingInboxRealtime();
  const { data: conversations, isLoading } = useConversations(inboxFilter);
  const { data: archivedList } = useConversations("archived", {
    enabled: inboxFilter === "archived",
  });
  const { data: viewer } = useViewerRole();
  const userId = viewer?.userId ?? null;

  const totalUnread = conversations?.reduce((n, c) => n + c.unread_count, 0) ?? 0;
  const archivedCount =
    inboxFilter === "archived" ? (archivedList?.length ?? 0) : 0;
  const isSidebar = variant === "sidebar";

  return (
    <div
      className={cn(
        "flex flex-col",
        isSidebar && "h-full min-h-0 border-white/[0.06] lg:border-r"
      )}
    >
      {isSidebar ? (
        <div className="shrink-0 border-b border-white/[0.06] px-4 py-4">
          <h2 className="font-display text-lg font-semibold">Messages</h2>
          {totalUnread > 0 ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{totalUnread} unread</p>
          ) : null}
        </div>
      ) : (
        <AppHeader
          title="Messages"
          subtitle={
            inboxFilter === "archived"
              ? "Archived"
              : totalUnread > 0
                ? `${totalUnread} unread`
                : undefined
          }
        />
      )}

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          isSidebar ? "overflow-hidden" : "px-4 pb-8"
        )}
      >
        <div className={cn("shrink-0", isSidebar ? "px-3 py-3" : "mb-4")}>
          <SegmentedControl
            value={inboxFilter}
            onChange={setInboxFilter}
            segments={[
              { value: "active", label: "Inbox" },
              {
                value: "archived",
                label:
                  inboxFilter === "archived" && archivedCount > 0
                    ? `Archived (${archivedCount})`
                    : "Archived",
              },
            ]}
          />
        </div>

        {error ? (
          <div
            className={cn(
              "mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200",
              isSidebar && "mx-3"
            )}
          >
            Could not open chat: {decodeURIComponent(error.replace(/\+/g, " "))}
          </div>
        ) : null}

        <div className={cn("min-h-0 flex-1 overflow-y-auto", isSidebar && "px-1")}>
          {isLoading ? (
            <PageLoader />
          ) : !conversations?.length ? (
            inboxFilter === "archived" ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No archived conversations.
              </p>
            ) : (
              <MessagesEmptyState />
            )
          ) : !userId ? (
            <PageLoader />
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {conversations.map((item) => (
                <ConversationListItem
                  key={item.conversation_id}
                  item={item}
                  currentUserId={userId}
                  inboxFilter={inboxFilter}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
