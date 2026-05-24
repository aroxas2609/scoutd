import { describe, expect, it } from "vitest";
import { countUnreadMessages, messagePreview } from "./types";

describe("countUnreadMessages", () => {
  const currentUserId = "user-a";

  it("excludes messages sent by the current user", () => {
    const count = countUnreadMessages(
      [
        { sender_id: currentUserId, created_at: "2025-01-02T00:00:00Z" },
        { sender_id: "user-b", created_at: "2025-01-02T01:00:00Z" },
      ],
      null,
      currentUserId
    );
    expect(count).toBe(1);
  });

  it("counts all peer messages when lastReadAt is null", () => {
    const count = countUnreadMessages(
      [
        { sender_id: "user-b", created_at: "2025-01-01T00:00:00Z" },
        { sender_id: "user-b", created_at: "2025-01-02T00:00:00Z" },
      ],
      null,
      currentUserId
    );
    expect(count).toBe(2);
  });

  it("only counts messages after lastReadAt", () => {
    const count = countUnreadMessages(
      [
        { sender_id: "user-b", created_at: "2025-01-01T00:00:00Z" },
        { sender_id: "user-b", created_at: "2025-01-03T00:00:00Z" },
      ],
      "2025-01-02T00:00:00Z",
      currentUserId
    );
    expect(count).toBe(1);
  });

  it("returns zero for an empty list", () => {
    expect(countUnreadMessages([], "2025-01-01T00:00:00Z", currentUserId)).toBe(0);
  });
});

describe("messagePreview", () => {
  it("returns placeholder when there is no message", () => {
    expect(messagePreview(null)).toBe("No messages yet");
  });

  it("prefixes own messages with You:", () => {
    expect(
      messagePreview(
        { body: "Hello", type: "text", metadata: {} },
        "me",
        "me"
      )
    ).toBe("You: Hello");
  });

  it("truncates long message bodies", () => {
    const body = "a".repeat(100);
    const preview = messagePreview({ body, type: "text", metadata: {} });
    expect(preview.endsWith("…")).toBe(true);
    expect(preview.length).toBeLessThan(body.length);
  });
});
