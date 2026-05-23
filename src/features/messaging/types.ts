import type { Conversation, Message } from "@/types/database";
import type { MessageParticipant } from "./participant-display";
import type { UserRole } from "@/types/database";

export type ConversationPreview = {
  conversation_id: string;
  last_read_at: string | null;
  conversation: Conversation;
  other_user: MessageParticipant;
  last_message: Pick<Message, "body" | "sender_id" | "created_at" | "type" | "metadata"> | null;
  unread_count: number;
};

export function profilePathFor(role: UserRole | null, userId: string) {
  if (role === "coach") return `/profile/coach/${userId}`;
  return `/profile/player/${userId}`;
}

export function messagePreview(
  msg: Pick<Message, "body" | "type" | "metadata"> | null,
  senderId?: string,
  currentUserId?: string
) {
  if (!msg) return "No messages yet";
  if (msg.type === "trial_invite") return "Trial invite";
  if (msg.metadata && typeof msg.metadata === "object" && "deleted_at" in msg.metadata) {
    const prefix =
      senderId && currentUserId && senderId === currentUserId ? "You: " : "";
    return `${prefix}Message deleted`;
  }
  const prefix =
    senderId && currentUserId && senderId === currentUserId ? "You: " : "";
  const text = msg.body.trim() || "Message";
  return prefix + (text.length > 80 ? `${text.slice(0, 80)}…` : text);
}

export function countUnreadMessages(
  messages: Pick<Message, "created_at" | "sender_id">[],
  lastReadAt: string | null,
  currentUserId: string
) {
  return messages.filter((m) => {
    if (m.sender_id === currentUserId) return false;
    if (!lastReadAt) return true;
    return new Date(m.created_at) > new Date(lastReadAt);
  }).length;
}
