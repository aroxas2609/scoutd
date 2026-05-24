import { describe, expect, it } from "vitest";
import { shouldRunCoachSearch } from "./search-enabled";

const base = {
  isBrowsing: true,
  hasQuery: false,
  hasActiveFilters: false,
};

describe("shouldRunCoachSearch", () => {
  it("returns false when only browsing discover sections", () => {
    expect(shouldRunCoachSearch(base)).toBe(false);
  });

  it("returns true when not browsing", () => {
    expect(shouldRunCoachSearch({ ...base, isBrowsing: false })).toBe(true);
  });

  it("returns false during browse even if filters would apply elsewhere", () => {
    expect(
      shouldRunCoachSearch({
        ...base,
        hasQuery: true,
        hasActiveFilters: true,
      })
    ).toBe(false);
  });
});
