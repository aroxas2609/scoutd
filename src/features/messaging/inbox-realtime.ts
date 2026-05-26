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

export function messagesInFilter(conversationIds: string[]): string {
  return `conversation_id=in.(${conversationIds.join(",")})`;
}

export function inboxRealtimeSubscriptionKey(conversationIds: string[]): string {
  return uniqueConversationIds(conversationIds).sort().join(",");
}
