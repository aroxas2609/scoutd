import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { QueryClient } from "@tanstack/react-query";
import type { Message } from "@/types/database";

export const MESSAGE_LIST_SELECT =
  "id, conversation_id, sender_id, body, type, metadata, created_at";

let inboxInvalidateTimer: ReturnType<typeof setTimeout> | null = null;

/** Debounced inbox/unread refresh so realtime does not refetch the full inbox per event. */
export function scheduleMessagingInboxRefresh(qc: QueryClient, delayMs = 800) {
  if (inboxInvalidateTimer) clearTimeout(inboxInvalidateTimer);
  inboxInvalidateTimer = setTimeout(() => {
    inboxInvalidateTimer = null;
    qc.invalidateQueries({ queryKey: ["conversations"] });
    qc.invalidateQueries({ queryKey: ["unread-messages-count"] });
  }, delayMs);
}

function appendMessage(list: Message[], row: Message): Message[] {
  if (list.some((m) => m.id === row.id)) return list;
  return [...list, row].sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function appendMessageToCache(
  current: Message[] | undefined,
  row: Message
): Message[] {
  return appendMessage(current ?? [], row);
}

export function applyMessagesRealtimePayload(
  current: Message[] | undefined,
  payload: RealtimePostgresChangesPayload<Message>
): Message[] | undefined {
  if (payload.eventType === "INSERT") {
    const row = payload.new;
    if (!row?.id) return current;
    return appendMessage(current ?? [], row);
  }

  if (!current) return current;

  if (payload.eventType === "UPDATE") {
    const row = payload.new;
    if (!row?.id) return current;
    return current.map((m) => (m.id === row.id ? row : m));
  }

  if (payload.eventType === "DELETE") {
    const id = payload.old?.id;
    if (!id) return current;
    return current.filter((m) => m.id !== id);
  }

  return current;
}
