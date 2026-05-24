import type { ConversationPreview } from "./types";

export function sumUnreadFromPreviews(
  previews: Pick<ConversationPreview, "unread_count">[]
): number {
  return previews.reduce((sum, p) => sum + p.unread_count, 0);
}
