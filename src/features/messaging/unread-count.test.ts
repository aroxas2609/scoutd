import { describe, expect, it } from "vitest";
import { sumUnreadFromPreviews } from "./unread-count";

describe("sumUnreadFromPreviews", () => {
  it("returns 0 for empty list", () => {
    expect(sumUnreadFromPreviews([])).toBe(0);
  });

  it("sums unread_count across previews", () => {
    expect(
      sumUnreadFromPreviews([
        { unread_count: 2 },
        { unread_count: 0 },
        { unread_count: 3 },
      ])
    ).toBe(5);
  });
});
