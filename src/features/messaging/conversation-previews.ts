import type { Conversation, Message } from "@/types/database";
import type { MessageParticipant } from "./participant-display";
import { countUnreadMessages, type ConversationPreview } from "./types";

export type ParticipantRow = {
  conversation_id: string;
  last_read_at: string | null;
  conversations:
    | Conversation
    | Conversation[]
    | null;
};

export type MessageRow = {
  conversation_id: string;
  body: string;
  sender_id: string;
  created_at: string;
  type: Message["type"];
  metadata: Record<string, unknown>;
};

export type OtherParticipantRow = {
  conversation_id: string;
  user_id: string;
};

const EMPTY_PARTICIPANT: MessageParticipant = {
  id: "",
  full_name: null,
  avatar_url: null,
  role: null,
  email: null,
  club_name: null,
};

export function buildConversationPreviews(
  participants: ParticipantRow[],
  otherParticipants: OtherParticipantRow[],
  allMessages: MessageRow[],
  participantsByUserId: Map<string, MessageParticipant>,
  currentUserId: string
): ConversationPreview[] {
  const otherByConv = new Map(
    otherParticipants.map((p) => [
      p.conversation_id,
      participantsByUserId.get(p.user_id) ?? {
        ...EMPTY_PARTICIPANT,
        id: p.user_id,
      },
    ])
  );

  const messagesByConv = new Map<string, MessageRow[]>();
  for (const msg of allMessages) {
    const list = messagesByConv.get(msg.conversation_id) ?? [];
    list.push(msg);
    messagesByConv.set(msg.conversation_id, list);
  }

  const previews: ConversationPreview[] = participants.map((p) => {
    const conversation = Array.isArray(p.conversations)
      ? p.conversations[0]
      : p.conversations;
    const msgs = messagesByConv.get(p.conversation_id) ?? [];
    const lastMessage =
      msgs.length > 0
        ? [...msgs].sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0]
        : null;
    const unread_count = countUnreadMessages(msgs, p.last_read_at, currentUserId);

    return {
      conversation_id: p.conversation_id,
      last_read_at: p.last_read_at,
      conversation: conversation!,
      other_user: otherByConv.get(p.conversation_id) ?? EMPTY_PARTICIPANT,
      last_message: lastMessage
        ? {
            body: lastMessage.body,
            sender_id: lastMessage.sender_id,
            created_at: lastMessage.created_at,
            type: lastMessage.type,
            metadata: lastMessage.metadata ?? {},
          }
        : null,
      unread_count,
    };
  });

  previews.sort(
    (a, b) =>
      new Date(b.conversation.updated_at).getTime() -
      new Date(a.conversation.updated_at).getTime()
  );

  return previews;
}

export function sumUnreadCounts(previews: ConversationPreview[]): number {
  return previews.reduce((sum, p) => sum + p.unread_count, 0);
}
