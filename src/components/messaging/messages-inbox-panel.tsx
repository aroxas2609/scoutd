"use client";

import { useMemo, useState } from "react";
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
import { EnablePushBanner } from "@/components/push/enable-push-banner";
import { useAuthUserId } from "@/features/auth/use-viewer-role";
import { cn } from "@/lib/utils";

type MessagesInboxPanelProps = {
  /** Desktop sidebar: omit app-level header */
  variant?: "page" | "sidebar";
};

export function MessagesInboxPanel({ variant = "page" }: MessagesInboxPanelProps) {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [inboxFilter, setInboxFilter] = useState<ConversationInboxFilter>("active");
  const { data: conversations, isLoading, isError, error: loadError } = useConversations(
    inboxFilter,
    { refetchInterval: 30_000 }
  );
  const { data: archivedList } = useConversations("archived", {
    enabled: inboxFilter === "archived",
    refetchInterval: inboxFilter === "archived" ? 30_000 : false,
  });

  const inboxRealtimeConversationIds = useMemo(() => {
    const ids = (conversations ?? []).map((c) => c.conversation_id);
    if (inboxFilter === "archived" && archivedList?.length) {
      for (const c of archivedList) ids.push(c.conversation_id);
    }
    return ids;
  }, [conversations, archivedList, inboxFilter]);

  useMessagingInboxRealtime(inboxRealtimeConversationIds);
  const { data: userId } = useAuthUserId();

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
        <>
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
          <EnablePushBanner className="mt-0" />
        </>
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
          {isError ? (
            <p className="py-12 px-4 text-center text-sm text-red-300">
              Could not load conversations.
              {loadError instanceof Error ? ` ${loadError.message}` : null}
            </p>
          ) : isLoading ? (
            <PageLoader />
          ) : !conversations?.length ? (
            inboxFilter === "archived" ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No archived conversations.
              </p>
            ) : (
              <MessagesEmptyState />
            )
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {conversations.map((item) => (
                <ConversationListItem
                  key={item.conversation_id}
                  item={item}
                  currentUserId={userId ?? ""}
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
