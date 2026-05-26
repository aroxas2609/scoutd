import { describe, expect, it } from "vitest";
import {
  chunkConversationIds,
  inboxRealtimeSubscriptionKey,
  messagesInFilter,
  uniqueConversationIds,
} from "./inbox-realtime";

describe("inbox-realtime", () => {
  it("dedupes conversation ids", () => {
    const a = "00000000-0000-4000-8000-000000000001";
    const b = "00000000-0000-4000-8000-000000000002";
    expect(uniqueConversationIds([a, a, b, ""])).toEqual([a, b]);
  });

  it("chunks large id lists", () => {
    const ids = Array.from({ length: 85 }, (_, i) =>
      `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`
    );
    const chunks = chunkConversationIds(ids);
    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toHaveLength(80);
    expect(chunks[1]).toHaveLength(5);
  });

  it("builds in filter for realtime with quoted UUIDs", () => {
    const id = "00000000-0000-4000-8000-000000000001";
    expect(messagesInFilter([id])).toBe(`conversation_id=in.("${id}")`);
  });

  it("stable subscription key regardless of order", () => {
    const a = "00000000-0000-4000-8000-000000000001";
    const b = "00000000-0000-4000-8000-000000000002";
    expect(inboxRealtimeSubscriptionKey([b, a])).toBe(inboxRealtimeSubscriptionKey([a, b]));
  });
});
