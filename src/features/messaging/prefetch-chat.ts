import type { QueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { resolveAuthSession } from "@/lib/auth/resolve-auth-session";
import type { Message } from "@/types/database";
import { MESSAGE_LIST_SELECT } from "./message-cache";
import type { MessageParticipant } from "./participant-display";
import { fetchParticipantsByUserIds } from "./participant-display";
import type { ConversationPreview } from "./types";

async function resolveOtherParticipantId(
  supabase: ReturnType<typeof createClient>,
  conversationId: string,
  currentUserId: string
): Promise<string | null> {
  const { data: others } = await supabase
    .from("conversation_participants")
    .select("user_id")
    .eq("conversation_id", conversationId)
    .neq("user_id", currentUserId)
    .limit(1)
    .maybeSingle();

  if (others?.user_id) return others.user_id;

  const { data: senders } = await supabase
    .from("messages")
    .select("sender_id")
    .eq("conversation_id", conversationId)
    .neq("sender_id", currentUserId)
    .order("created_at", { ascending: false })
    .limit(1);

  return senders?.[0]?.sender_id ?? null;
}

export async function fetchConversationMessages(
  conversationId: string
): Promise<Message[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("messages")
    .select(MESSAGE_LIST_SELECT)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  return (data ?? []) as Message[];
}

export async function fetchConversationPeer(
  qc: QueryClient,
  conversationId: string
): Promise<MessageParticipant | null> {
  const cached = peerFromConversationsCache(qc, conversationId);
  if (cached) return cached;

  const supabase = createClient();
  const session = await resolveAuthSession(qc);
  if (!session) return null;

  const otherUserId = await resolveOtherParticipantId(
    supabase,
    conversationId,
    session.userId
  );
  if (!otherUserId) return null;

  const map = await fetchParticipantsByUserIds(supabase, [otherUserId]);
  return map.get(otherUserId) ?? null;
}

export function peerFromConversationsCache(
  qc: QueryClient,
  conversationId: string
): MessageParticipant | null {
  for (const key of [["conversations", "active"], ["conversations", "archived"]] as const) {
    const list = qc.getQueryData<ConversationPreview[]>(key);
    const item = list?.find((c) => c.conversation_id === conversationId);
    if (item?.other_user) return item.other_user;
  }
  return null;
}

export function prefetchChat(qc: QueryClient, conversationId: string) {
  if (!conversationId) return;

  const cachedPeer = peerFromConversationsCache(qc, conversationId);
  if (cachedPeer) {
    qc.setQueryData(["conversation-peer", conversationId], cachedPeer);
  }

  void qc.prefetchQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchConversationMessages(conversationId),
    staleTime: 30_000,
  });

  if (!cachedPeer) {
    void qc.prefetchQuery({
      queryKey: ["conversation-peer", conversationId],
      queryFn: () => fetchConversationPeer(qc, conversationId),
      staleTime: 60_000,
    });
  }
}
