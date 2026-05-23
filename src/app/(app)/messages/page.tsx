"use client";

import { useEffect, useState } from "react";
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
import { createClient } from "@/lib/supabase/client";

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [inboxFilter, setInboxFilter] = useState<ConversationInboxFilter>("active");
  useMessagingInboxRealtime();
  const { data: conversations, isLoading } = useConversations(inboxFilter);
  const { data: archivedList } = useConversations("archived");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const totalUnread = conversations?.reduce((n, c) => n + c.unread_count, 0) ?? 0;
  const archivedCount = archivedList?.length ?? 0;

  return (
    <div>
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
      <div className="px-4 pb-8">
        <SegmentedControl
          className="mb-4"
          value={inboxFilter}
          onChange={setInboxFilter}
          segments={[
            { value: "active", label: "Inbox" },
            {
              value: "archived",
              label: archivedCount > 0 ? `Archived (${archivedCount})` : "Archived",
            },
          ]}
        />

        {error ? (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            Could not open chat: {decodeURIComponent(error.replace(/\+/g, " "))}
          </div>
        ) : null}

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
  );
}
