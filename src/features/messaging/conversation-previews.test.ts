import { describe, expect, it } from "vitest";
import {
  buildConversationPreviews,
  sumUnreadCounts,
  type MessageRow,
  type ParticipantRow,
} from "./conversation-previews";
import type { Conversation } from "@/types/database";
import type { MessageParticipant } from "./participant-display";

const conversationA: Conversation = {
  id: "conv-a",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-03T00:00:00Z",
  status: "active",
};

const conversationB: Conversation = {
  id: "conv-b",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-05T00:00:00Z",
  status: "active",
};

const otherUser: MessageParticipant = {
  id: "user-b",
  full_name: "Coach B",
  avatar_url: null,
  role: "coach",
  email: null,
  club_name: "Club",
};

describe("buildConversationPreviews", () => {
  it("builds previews with last message and unread counts", () => {
    const participants: ParticipantRow[] = [
      {
        conversation_id: "conv-a",
        last_read_at: "2025-01-02T00:00:00Z",
        conversations: conversationA,
      },
      {
        conversation_id: "conv-b",
        last_read_at: null,
        conversations: conversationB,
      },
    ];

    const messages: MessageRow[] = [
      {
        conversation_id: "conv-a",
        body: "Older",
        sender_id: "user-b",
        created_at: "2025-01-01T12:00:00Z",
        type: "text",
        metadata: null,
      },
      {
        conversation_id: "conv-a",
        body: "Latest",
        sender_id: "user-b",
        created_at: "2025-01-03T12:00:00Z",
        type: "text",
        metadata: null,
      },
      {
        conversation_id: "conv-b",
        body: "Hi",
        sender_id: "user-b",
        created_at: "2025-01-04T12:00:00Z",
        type: "text",
        metadata: null,
      },
    ];

    const previews = buildConversationPreviews(
      participants,
      [
        { conversation_id: "conv-a", user_id: "user-b" },
        { conversation_id: "conv-b", user_id: "user-b" },
      ],
      messages,
      new Map([["user-b", otherUser]]),
      "user-a"
    );

    expect(previews).toHaveLength(2);
    expect(previews[0].conversation_id).toBe("conv-b");
    expect(previews[0].last_message?.body).toBe("Hi");
    expect(previews[0].unread_count).toBe(1);
    expect(previews[1].last_message?.body).toBe("Latest");
    expect(previews[1].unread_count).toBe(1);
  });
});

describe("sumUnreadCounts", () => {
  it("sums unread across previews", () => {
    expect(
      sumUnreadCounts([
        { unread_count: 2 } as never,
        { unread_count: 3 } as never,
      ])
    ).toBe(5);
  });
});
