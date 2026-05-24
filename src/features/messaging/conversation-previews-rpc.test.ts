import { describe, expect, it } from "vitest";
import {
  mapRpcRowsToConversationPreviews,
  type ConversationPreviewRpcRow,
} from "./conversation-previews-rpc";
import type { MessageParticipant } from "./participant-display";

const conversation = {
  id: "conv-1",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-02T00:00:00Z",
  status: "active" as const,
};

describe("mapRpcRowsToConversationPreviews", () => {
  it("maps RPC rows to conversation previews", () => {
    const row: ConversationPreviewRpcRow = {
      conversation_id: "conv-1",
      last_read_at: null,
      conversation,
      other_user_id: "coach-1",
      last_message_body: "Hello",
      last_message_sender_id: "coach-1",
      last_message_created_at: "2025-01-02T10:00:00Z",
      last_message_type: "text",
      last_message_metadata: null,
      unread_count: 2,
    };

    const participant: MessageParticipant = {
      id: "coach-1",
      full_name: "Coach",
      avatar_url: null,
      role: "coach",
      email: null,
      club_name: "FC",
    };

    const [preview] = mapRpcRowsToConversationPreviews(
      [row],
      new Map([["coach-1", participant]])
    );

    expect(preview.conversation_id).toBe("conv-1");
    expect(preview.other_user.full_name).toBe("Coach");
    expect(preview.last_message?.body).toBe("Hello");
    expect(preview.unread_count).toBe(2);
  });

  it("uses empty last_message when RPC has no message fields", () => {
    const row: ConversationPreviewRpcRow = {
      conversation_id: "conv-2",
      last_read_at: "2025-01-01T00:00:00Z",
      conversation: { ...conversation, id: "conv-2" },
      other_user_id: null,
      last_message_body: null,
      last_message_sender_id: null,
      last_message_created_at: null,
      last_message_type: null,
      last_message_metadata: null,
      unread_count: 0,
    };

    const [preview] = mapRpcRowsToConversationPreviews([row], new Map());
    expect(preview.last_message).toBeNull();
    expect(preview.other_user.id).toBe("");
  });
});
