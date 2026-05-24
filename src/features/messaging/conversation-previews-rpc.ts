import type { Conversation, Message } from "@/types/database";
import type { MessageParticipant } from "./participant-display";
import type { ConversationPreview } from "./types";

export type ConversationPreviewRpcRow = {
  conversation_id: string;
  last_read_at: string | null;
  conversation: Conversation;
  other_user_id: string | null;
  last_message_body: string | null;
  last_message_sender_id: string | null;
  last_message_created_at: string | null;
  last_message_type: Message["type"] | null;
  last_message_metadata: Record<string, unknown> | null;
  unread_count: number;
};

const EMPTY_PARTICIPANT: MessageParticipant = {
  id: "",
  full_name: null,
  avatar_url: null,
  role: null,
  email: null,
  club_name: null,
};

export function mapRpcRowsToConversationPreviews(
  rows: ConversationPreviewRpcRow[],
  participantsByUserId: Map<string, MessageParticipant>
): ConversationPreview[] {
  return rows.map((row) => {
    const other_user =
      row.other_user_id != null
        ? participantsByUserId.get(row.other_user_id) ?? {
            ...EMPTY_PARTICIPANT,
            id: row.other_user_id,
          }
        : EMPTY_PARTICIPANT;

    const last_message: ConversationPreview["last_message"] =
      row.last_message_created_at && row.last_message_sender_id
        ? {
            body: row.last_message_body ?? "",
            sender_id: row.last_message_sender_id,
            created_at: row.last_message_created_at,
            type: row.last_message_type ?? "text",
            metadata: row.last_message_metadata ?? {},
          }
        : null;

    return {
      conversation_id: row.conversation_id,
      last_read_at: row.last_read_at,
      conversation: row.conversation,
      other_user,
      last_message,
      unread_count: Number(row.unread_count) || 0,
    };
  });
}
