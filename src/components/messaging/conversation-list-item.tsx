"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  participantDisplayName,
  participantAvatarUrl,
} from "@/features/messaging/participant-display";
import { messageListSubtitle } from "@/features/profile/coach-display";
import { messagePreview, type ConversationPreview } from "@/features/messaging/types";
import type { ConversationInboxFilter } from "@/features/messaging/hooks";
import { ConversationListActions } from "@/components/messaging/conversation-list-actions";
import { cn } from "@/lib/utils";

type Props = {
  item: ConversationPreview;
  currentUserId: string;
  inboxFilter: ConversationInboxFilter;
};

export function ConversationListItem({ item, currentUserId, inboxFilter }: Props) {
  const name = participantDisplayName(item.other_user);
  const subtitle = messageListSubtitle(item.other_user);
  const avatarUrl = participantAvatarUrl(item.other_user);
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const hasUnread = item.unread_count > 0;
  const preview = messagePreview(item.last_message, item.last_message?.sender_id, currentUserId);
  const time = item.last_message?.created_at ?? item.conversation.updated_at;

  return (
    <li className="flex items-stretch gap-1">
      <Link
        href={`/messages/${item.conversation_id}`}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition-colors hover:bg-white/[0.03]",
          hasUnread && "border-white/[0.06] bg-white/[0.02]"
        )}
      >
        <div className="relative shrink-0">
          <Avatar size="lg" className="size-11">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
            <AvatarFallback className="bg-[var(--bg-elevated)] text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          {hasUnread ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent-brand)] px-1 text-[9px] font-semibold text-[var(--primary-foreground)]">
              {item.unread_count > 9 ? "9+" : item.unread_count}
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className={cn("truncate text-[15px]", hasUnread ? "font-semibold" : "font-medium")}>
              {name}
            </p>
            {time ? (
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(time), { addSuffix: true })}
              </span>
            ) : null}
          </div>
          {subtitle ? (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
          <p
            className={cn(
              "truncate text-sm",
              hasUnread ? "text-foreground/90" : "text-muted-foreground"
            )}
          >
            {preview}
          </p>
          {item.conversation.status === "pending" ? (
            <p className="mt-0.5 text-xs text-[var(--accent-brand)]">Message request</p>
          ) : null}
        </div>
      </Link>
      <ConversationListActions
        conversationId={item.conversation_id}
        inboxFilter={inboxFilter}
      />
    </li>
  );
}
