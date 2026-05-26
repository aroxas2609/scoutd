"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { resolveAuthSession } from "@/lib/auth/resolve-auth-session";
import type { Message } from "@/types/database";
import {
  appendMessageToCache,
  applyMessagesRealtimePayload,
  MESSAGE_LIST_SELECT,
  scheduleMessagingInboxRefresh,
} from "./message-cache";
import {
  fetchConversationMessages,
  fetchConversationPeer,
  peerFromConversationsCache,
} from "./prefetch-chat";
import {
  fetchParticipantsByUserIds,
  type MessageParticipant,
} from "./participant-display";
import type { ConversationPreview } from "./types";
import { buildConversationPreviews } from "./conversation-previews";
import {
  mapRpcRowsToConversationPreviews,
  type ConversationPreviewRpcRow,
} from "./conversation-previews-rpc";
import { sumUnreadFromPreviews } from "./unread-count";
import {
  chunkConversationIds,
  INBOX_REALTIME_EQ_CHANNEL_LIMIT,
  inboxRealtimeSubscriptionKey,
  messageEqFilter,
  messagesInFilter,
  uniqueConversationIds,
} from "./inbox-realtime";

export type ConversationInboxFilter = "active" | "archived";

async function fetchConversationPreviewsLegacy(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  inboxFilter: ConversationInboxFilter = "active"
): Promise<ConversationPreview[]> {
  let query = supabase
    .from("conversation_participants")
    .select("conversation_id, last_read_at, archived_at, conversations(*)")
    .eq("user_id", userId);

  if (inboxFilter === "archived") {
    query = query.not("archived_at", "is", null);
  } else {
    query = query.is("archived_at", null);
  }

  const { data: participants } = await query;

  if (!participants?.length) return [];

  const convIds = participants.map((p) => p.conversation_id);

  const [{ data: otherParticipants }, { data: allMessages }] = await Promise.all([
    supabase
      .from("conversation_participants")
      .select("conversation_id, user_id")
      .in("conversation_id", convIds)
      .neq("user_id", userId),
    supabase
      .from("messages")
      .select("conversation_id, body, sender_id, created_at, type, metadata")
      .in("conversation_id", convIds)
      .order("created_at", { ascending: false }),
  ]);

  const otherUserIds = (otherParticipants ?? []).map((p) => p.user_id);
  const participantsByUserId = await fetchParticipantsByUserIds(supabase, otherUserIds);

  return buildConversationPreviews(
    participants as Parameters<typeof buildConversationPreviews>[0],
    otherParticipants ?? [],
    (allMessages ?? []) as Parameters<typeof buildConversationPreviews>[2],
    participantsByUserId,
    userId
  );
}

async function fetchConversationPreviews(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  inboxFilter: ConversationInboxFilter = "active"
): Promise<ConversationPreview[]> {
  const { data, error } = await supabase.rpc("get_conversation_previews", {
    p_inbox_filter: inboxFilter,
  });

  if (!error && data) {
    const rows = data as ConversationPreviewRpcRow[];
    const otherUserIds = rows
      .map((r) => r.other_user_id)
      .filter((id): id is string => !!id);
    const participantsByUserId = await fetchParticipantsByUserIds(supabase, otherUserIds);
    return mapRpcRowsToConversationPreviews(rows, participantsByUserId);
  }

  return fetchConversationPreviewsLegacy(supabase, userId, inboxFilter);
}

export const fetchConversationsForUser = fetchConversationPreviews;

export function useConversations(
  inboxFilter: ConversationInboxFilter = "active",
  options?: { enabled?: boolean; refetchInterval?: number | false }
) {
  const supabase = createClient();
  const qc = useQueryClient();
  const enabled = options?.enabled ?? true;

  return useQuery({
    queryKey: ["conversations", inboxFilter],
    enabled,
    staleTime: 30_000,
    refetchInterval: options?.refetchInterval,
    queryFn: async () => {
      const session = await resolveAuthSession(qc);
      if (!session) return [];

      return fetchConversationPreviews(supabase, session.userId, inboxFilter);
    },
  });
}

/**
 * Live inbox updates scoped to the user's conversations (not all messages on the project).
 * Call once on the messages inbox page with IDs from loaded conversation previews.
 */
export function useMessagingInboxRealtime(conversationIds: string[]) {
  const supabase = createClient();
  const qc = useQueryClient();
  const subscriptionKey = useMemo(
    () => inboxRealtimeSubscriptionKey(conversationIds),
    [conversationIds]
  );

  useEffect(() => {
    if (!subscriptionKey) return;

    const ids = uniqueConversationIds(conversationIds);
    const channels: RealtimeChannel[] = [];

    function attachChannel(name: string, filter: string) {
      const channel = supabase
        .channel(name)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
            filter,
          },
          () => {
            scheduleMessagingInboxRefresh(qc);
          }
        )
        .subscribe();
      channels.push(channel);
    }

    if (ids.length <= INBOX_REALTIME_EQ_CHANNEL_LIMIT) {
      for (const id of ids) {
        attachChannel(`conversations-inbox-${id.slice(0, 8)}`, messageEqFilter(id));
      }
    } else {
      const chunks = chunkConversationIds(ids);
      for (let i = 0; i < chunks.length; i++) {
        attachChannel(`conversations-inbox-${i}`, messagesInFilter(chunks[i]));
      }
    }

    return () => {
      for (const channel of channels) {
        void supabase.removeChannel(channel);
      }
    };
  }, [subscriptionKey, supabase, qc]);
}

async function fetchUnreadMessageCount(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<number> {
  const { data, error } = await supabase.rpc("get_unread_message_count");

  if (!error && data != null) {
    return typeof data === "number" ? data : Number(data);
  }

  const previews = await fetchConversationPreviews(supabase, userId, "active");
  return sumUnreadFromPreviews(previews);
}

export function useUnreadMessageCount() {
  const supabase = createClient();
  const qc = useQueryClient();

  return useQuery({
    queryKey: ["unread-messages-count"],
    queryFn: async () => {
      const session = await resolveAuthSession(qc);
      if (!session) return 0;

      return fetchUnreadMessageCount(supabase, session.userId);
    },
  });
}

const markReadInFlight = new Map<string, Promise<void>>();

export function useConversationPeer(conversationId: string) {
  const qc = useQueryClient();
  const cachedPeer = peerFromConversationsCache(qc, conversationId);

  return useQuery<MessageParticipant | null>({
    queryKey: ["conversation-peer", conversationId],
    queryFn: () => fetchConversationPeer(qc, conversationId),
    enabled: !!conversationId,
    initialData: cachedPeer ?? undefined,
    initialDataUpdatedAt: cachedPeer ? Date.now() : undefined,
    staleTime: 60_000,
  });
}

export function useMarkConversationRead(conversationId: string) {
  const supabase = createClient();
  const qc = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const inFlight = markReadInFlight.get(conversationId);
    if (inFlight) return;

    const task = (async () => {
      const session = await resolveAuthSession(qc);
      if (!session) return;

      await supabase
        .from("conversation_participants")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("user_id", session.userId);

      scheduleMessagingInboxRefresh(qc);
    })();

    markReadInFlight.set(conversationId, task);
    void task.finally(() => {
      if (markReadInFlight.get(conversationId) === task) {
        markReadInFlight.delete(conversationId);
      }
    });
  }, [conversationId, supabase, qc]);
}

export function useMessages(conversationId: string) {
  const supabase = createClient();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchConversationMessages(conversationId),
    enabled: !!conversationId,
    staleTime: 30_000,
  });

  useMarkConversationRead(conversationId);

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: RealtimePostgresChangesPayload<Message>) => {
          qc.setQueryData<Message[]>(
            ["messages", conversationId],
            (current) => applyMessagesRealtimePayload(current, payload)
          );
          scheduleMessagingInboxRefresh(qc);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase, qc]);

  return query;
}

export function useSendMessage(conversationId: string) {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data: inserted, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          body,
          type: "text",
        })
        .select(MESSAGE_LIST_SELECT)
        .single();
      if (error) throw error;
      if (!inserted) throw new Error("Message was not created");
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString(), status: "active" })
        .eq("id", conversationId);

      await supabase
        .from("conversation_participants")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id);

      return inserted as Message;
    },
    onSuccess: (message) => {
      qc.setQueryData<Message[]>(["messages", conversationId], (current) =>
        appendMessageToCache(current, message)
      );
      scheduleMessagingInboxRefresh(qc);
    },
  });
}

export function useEditMessage(conversationId: string) {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageId, body }: { messageId: string; body: string }) => {
      const trimmed = body.trim();
      if (!trimmed) throw new Error("Message cannot be empty");

      const { data: existing } = await supabase
        .from("messages")
        .select("metadata")
        .eq("id", messageId)
        .single();

      const metadata = {
        ...((existing?.metadata as Record<string, unknown>) ?? {}),
        edited_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("messages")
        .update({ body: trimmed, metadata })
        .eq("id", messageId)
        .select("id");

      if (error) throw error;
      if (!data?.length) {
        throw new Error(
          "Could not edit message. Run 006_messages_edit_delete.sql in Supabase SQL Editor."
        );
      }

      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages", conversationId] });
      scheduleMessagingInboxRefresh(qc);
    },
  });
}

export function useDeleteMessage(conversationId: string) {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (messageId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: deleted, error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId)
        .select("id");

      if (error) throw error;

      if (!deleted?.length) {
        const { data: soft, error: softError } = await supabase
          .from("messages")
          .update({
            body: "This message was deleted",
            metadata: { deleted_at: new Date().toISOString() },
          })
          .eq("id", messageId)
          .eq("sender_id", user.id)
          .select("id");

        if (softError) {
          throw new Error(
            softError.message.includes("policy")
              ? "Could not delete. Run 006_messages_edit_delete.sql in Supabase SQL Editor."
              : softError.message
          );
        }
        if (!soft?.length) {
          throw new Error(
            "Could not delete message. Run 006_messages_edit_delete.sql in Supabase SQL Editor."
          );
        }
      }

      const { data: latest } = await supabase
        .from("messages")
        .select("created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      await supabase
        .from("conversations")
        .update({
          updated_at: latest?.created_at ?? new Date().toISOString(),
        })
        .eq("id", conversationId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages", conversationId] });
      scheduleMessagingInboxRefresh(qc);
    },
  });
}

function invalidateConversationLists(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["conversations"] });
  qc.invalidateQueries({ queryKey: ["unread-messages-count"] });
}

export function useArchiveConversation() {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("conversation_participants")
        .update({ archived_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id)
        .select("conversation_id");

      if (error) throw error;
      if (!data?.length) {
        throw new Error(
          "Could not archive. Run 007_conversation_archive.sql in Supabase SQL Editor."
        );
      }
    },
    onSuccess: () => invalidateConversationLists(qc),
  });
}

export function useUnarchiveConversation() {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("conversation_participants")
        .update({ archived_at: null })
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id)
        .select("conversation_id");

      if (error) throw error;
      if (!data?.length) throw new Error("Could not restore conversation");
    },
    onSuccess: () => invalidateConversationLists(qc),
  });
}

export function useRemoveConversation() {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("conversation_participants")
        .delete()
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id)
        .select("conversation_id");

      if (error) throw error;
      if (!data?.length) {
        throw new Error(
          "Could not remove. Run 007_conversation_archive.sql in Supabase SQL Editor."
        );
      }
    },
    onSuccess: () => invalidateConversationLists(qc),
  });
}
