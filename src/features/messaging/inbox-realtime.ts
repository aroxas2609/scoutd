/** Max conversation UUIDs per Realtime `in` filter (multiple channels if more). */
export const INBOX_REALTIME_FILTER_CHUNK = 80;

export function uniqueConversationIds(ids: string[]): string[] {
  return [...new Set(ids.filter(Boolean))];
}

export function chunkConversationIds(ids: string[]): string[][] {
  const unique = uniqueConversationIds(ids);
  const chunks: string[][] = [];
  for (let i = 0; i < unique.length; i += INBOX_REALTIME_FILTER_CHUNK) {
    chunks.push(unique.slice(i, i + INBOX_REALTIME_FILTER_CHUNK));
  }
  return chunks;
}

/** PostgREST Realtime `in` filter for UUID columns (quoted values). */
export function messagesInFilter(conversationIds: string[]): string {
  const quoted = conversationIds.map((id) => `"${id}"`).join(",");
  return `conversation_id=in.(${quoted})`;
}

export function messageEqFilter(conversationId: string): string {
  return `conversation_id=eq.${conversationId}`;
}

/** Prefer per-thread `eq` filters (reliable); use `in` only for larger lists. */
export const INBOX_REALTIME_EQ_CHANNEL_LIMIT = 25;

export function inboxRealtimeSubscriptionKey(conversationIds: string[]): string {
  return uniqueConversationIds(conversationIds).sort().join(",");
}
