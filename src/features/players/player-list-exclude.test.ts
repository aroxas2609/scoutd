import { describe, expect, it } from "vitest";
import { withoutExcludedUser } from "./repository";

describe("withoutExcludedUser", () => {
  const rows = [
    { user_id: "self-id", name: "Me" },
    { user_id: "other-id", name: "Them" },
  ];

  it("returns all rows when excludeUserId is omitted", () => {
    expect(withoutExcludedUser(rows)).toHaveLength(2);
  });

  it("removes the signed-in player from results", () => {
    const filtered = withoutExcludedUser(rows, "self-id");
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.user_id).toBe("other-id");
  });
});
