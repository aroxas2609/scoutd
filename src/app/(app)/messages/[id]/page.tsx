"use client";

import { use, useState, useEffect } from "react";
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

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

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
  const peerHref =
    peer?.id ? profilePathFor(peer.role, peer.id) : null;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage.mutateAsync(text);
      setText("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col lg:min-h-0 lg:flex-1">
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

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
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

      <ChatComposer
        value={text}
        onChange={setText}
        onSubmit={handleSend}
        disabled={sending}
      />
    </div>
  );
}
