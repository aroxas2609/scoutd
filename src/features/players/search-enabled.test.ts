import { describe, expect, it } from "vitest";
import { shouldRunPlayerSearch } from "./search-enabled";

const base = {
  isBrowsing: true,
  hasQuery: false,
  hasActiveFilters: false,
  myDistrict: false,
  nearbyEnabled: false,
};

describe("shouldRunPlayerSearch", () => {
  it("returns false when only browsing discover sections", () => {
    expect(shouldRunPlayerSearch(base)).toBe(false);
  });

  it("returns true when not browsing", () => {
    expect(shouldRunPlayerSearch({ ...base, isBrowsing: false })).toBe(true);
  });

  it("returns true when catalog browse is enabled", () => {
    expect(shouldRunPlayerSearch({ ...base, catalogEnabled: true })).toBe(true);
  });

  it("returns false during browse even if filters would apply elsewhere", () => {
    expect(
      shouldRunPlayerSearch({
        ...base,
        hasQuery: true,
        hasActiveFilters: true,
        myDistrict: true,
        nearbyEnabled: true,
      })
    ).toBe(false);
  });
});
