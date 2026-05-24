"use client";

import { use, useState, useEffect, useMemo } from "react";
import { useChatScroll } from "@/components/messaging/use-chat-scroll";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  useMessages,
  useSendMessage,
  useConversationPeer,
} from "@/features/messaging/hooks";
import { TrialInviteCard } from "@/components/messaging/trial-invite-card";
import { ChatComposer } from "@/components/messaging/chat-composer";
import { ChatMessageBubble } from "@/components/messaging/chat-message-bubble";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  participantDisplayName,
  participantSenderLabel,
  participantAvatarUrl,
} from "@/features/messaging/participant-display";
import { messageListSubtitle } from "@/features/profile/coach-display";
import { profilePathFor } from "@/features/messaging/types";
import { createClient } from "@/lib/supabase/client";

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: messages } = useMessages(id);
  const { data: peer, isLoading: peerLoading } = useConversationPeer(id);
  const sendMessage = useSendMessage(id);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const lastMessageKey = useMemo(() => {
    if (!messages?.length) return "empty";
    const last = messages[messages.length - 1];
    return `${messages.length}:${last.id}:${last.created_at}`;
  }, [messages]);

  const { scrollRef, stickToBottom } = useChatScroll(lastMessageKey);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    function onViewportChange() {
      stickToBottom();
    }

    viewport.addEventListener("resize", onViewportChange);
    viewport.addEventListener("scroll", onViewportChange);
    return () => {
      viewport.removeEventListener("resize", onViewportChange);
      viewport.removeEventListener("scroll", onViewportChange);
    };
  }, [stickToBottom]);

  const peerTitle = participantDisplayName(peer ?? undefined);
  const peerCoachName = peer ? messageListSubtitle(peer) : null;
  const peerSenderLabel = participantSenderLabel(peer ?? undefined);
  const peerAvatar = participantAvatarUrl(peer ?? undefined);
  const peerInitials = peerTitle
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const peerHref = peer?.id
    ? profilePathFor(peer.role, peer.id, `/messages/${id}`)
    : null;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage.mutateAsync(text);
      setText("");
      stickToBottom();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden lg:h-auto lg:max-h-none lg:min-h-0 lg:flex-1 lg:overflow-visible">
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/[0.06] bg-[var(--bg-deep)]/90 px-4 py-3 pt-[env(safe-area-inset-top)] backdrop-blur-md lg:pt-3">
        <Link
          href="/messages"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-[var(--bg-surface)] lg:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        {peerLoading && !peer ? (
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold">Chat</h1>
            <p className="text-xs text-muted-foreground">Loading…</p>
          </div>
        ) : peerHref ? (
          <Link href={peerHref} className="flex min-w-0 flex-1 items-center gap-3">
            <Avatar size="lg" className="size-10 shrink-0">
              {peerAvatar ? <AvatarImage src={peerAvatar} alt={peerTitle} /> : null}
              <AvatarFallback className="bg-[var(--bg-elevated)] text-xs font-medium">
                {peerInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold">{peerTitle}</h1>
              {peerCoachName ? (
                <p className="truncate text-xs text-muted-foreground">{peerCoachName}</p>
              ) : (
                <p className="text-xs text-muted-foreground">View profile</p>
              )}
            </div>
          </Link>
        ) : (
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold">{peerTitle}</h1>
            <p className="text-xs text-muted-foreground">Participant</p>
          </div>
        )}
      </header>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pt-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))]"
      >
        <div className="flex min-h-full flex-col justify-end gap-3">
          {!messages?.length && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No messages yet. Say hello below.
            </p>
          )}
          {messages?.map((m) =>
            m.type === "trial_invite" ? (
              <TrialInviteCard key={m.id} message={m} />
            ) : (
              <ChatMessageBubble
                key={m.id}
                message={m}
                conversationId={id}
                isOwn={m.sender_id === userId}
                senderLabel={m.sender_id !== userId ? peerSenderLabel : undefined}
              />
            )
          )}
        </div>
      </div>

      <ChatComposer
        value={text}
        onChange={setText}
        onSubmit={handleSend}
        disabled={sending}
      />
    </div>
  );
}
