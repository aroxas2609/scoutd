"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/types/database";
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

export function useConversations(
  inboxFilter: ConversationInboxFilter = "active",
  options?: { enabled?: boolean }
) {
  const supabase = createClient();
  const enabled = options?.enabled ?? true;

  return useQuery({
    queryKey: ["conversations", inboxFilter],
    enabled,
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      return fetchConversationPreviews(supabase, user.id, inboxFilter);
    },
  });
}

/** Call once on the messages inbox page (avoids duplicate channel subscriptions). */
export function useMessagingInboxRealtime() {
  const supabase = createClient();
  const qc = useQueryClient();

  useEffect(() => {
    inboxRealtimeRefCount += 1;

    if (!inboxRealtimeChannel) {
      inboxRealtimeChannel = supabase
        .channel("conversations-inbox")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "messages" },
          () => {
            qc.invalidateQueries({ queryKey: ["conversations"] });
            qc.invalidateQueries({ queryKey: ["unread-messages-count"] });
          }
        )
        .subscribe();
    }

    return () => {
      inboxRealtimeRefCount -= 1;
      if (inboxRealtimeRefCount <= 0 && inboxRealtimeChannel) {
        void supabase.removeChannel(inboxRealtimeChannel);
        inboxRealtimeChannel = null;
        inboxRealtimeRefCount = 0;
      }
    };
  }, [supabase, qc]);
}

let inboxRealtimeRefCount = 0;
let inboxRealtimeChannel: RealtimeChannel | null = null;

export function useUnreadMessageCount() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["unread-messages-count"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return 0;

      const previews = await fetchConversationPreviews(supabase, user.id, "active");
      return previews.reduce((sum, p) => sum + p.unread_count, 0);
    },
  });
}

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

export function useConversationPeer(conversationId: string) {
  const supabase = createClient();
  return useQuery<MessageParticipant | null>({
    queryKey: ["conversation-peer", conversationId],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const otherUserId = await resolveOtherParticipantId(
        supabase,
        conversationId,
        user.id
      );
      if (!otherUserId) return null;

      const map = await fetchParticipantsByUserIds(supabase, [otherUserId]);
      return map.get(otherUserId) ?? null;
    },
    enabled: !!conversationId,
  });
}

export function useMarkConversationRead(conversationId: string) {
  const supabase = createClient();
  const qc = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    async function markRead() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("conversation_participants")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id);

      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["unread-messages-count"] });
    }

    markRead();
  }, [conversationId, supabase, qc]);
}

export function useMessages(conversationId: string) {
  const supabase = createClient();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      return (data ?? []) as Message[];
    },
    enabled: !!conversationId,
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
        async () => {
          qc.invalidateQueries({ queryKey: ["messages", conversationId] });
          qc.invalidateQueries({ queryKey: ["conversations"] });
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from("conversation_participants")
              .update({ last_read_at: new Date().toISOString() })
              .eq("conversation_id", conversationId)
              .eq("user_id", user.id);
            qc.invalidateQueries({ queryKey: ["conversations"] });
            qc.invalidateQueries({ queryKey: ["unread-messages-count"] });
          }
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
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        body,
        type: "text",
      });
      if (error) throw error;
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString(), status: "active" })
        .eq("id", conversationId);

      await supabase
        .from("conversation_participants")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id);

      const { data: participants } = await supabase
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", conversationId);

      const recipientId = participants?.find((p) => p.user_id !== user.id)?.user_id;
      if (recipientId) {
        await supabase.from("notifications").insert({
          user_id: recipientId,
          type: "new_message",
          title: "New message",
          body: body.slice(0, 120),
          metadata: { conversation_id: conversationId, sender_id: user.id },
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages", conversationId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["unread-messages-count"] });
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
      qc.invalidateQueries({ queryKey: ["conversations"] });
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
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["unread-messages-count"] });
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
