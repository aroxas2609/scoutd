import { describe, expect, it } from "vitest";
import {
  buildPlayerSearchOrClause,
  maxPostcodesForNearbyRadius,
  pickNearbySearchPostcodes,
  quotePostgrestOrPattern,
  shouldTryWordAndNameMatch,
  splitSearchWords,
} from "./player-search-query";
import type { PostcodeLocationsMap } from "@/lib/geo/location-radius";

describe("quotePostgrestOrPattern", () => {
  it("quotes patterns with spaces", () => {
    expect(quotePostgrestOrPattern("%anthony roxas%")).toBe('"%anthony roxas%"');
  });
});

describe("buildPlayerSearchOrClause", () => {
  it("includes location clauses and name user ids", () => {
    const clause = buildPlayerSearchOrClause("Smith", ["user-1"]);
    expect(clause).toContain("user_id.in.(user-1)");
    expect(clause).toContain("suburb.ilike.");
  });

  it("returns null for blank input without name ids", () => {
    expect(buildPlayerSearchOrClause("   ")).toBeNull();
  });
});


describe("splitSearchWords", () => {
  it("splits on whitespace", () => {
    expect(splitSearchWords("  Anthony   Roxas ")).toEqual(["Anthony", "Roxas"]);
  });
});

describe("shouldTryWordAndNameMatch", () => {
  it("is true for multi-word with no phrase hits", () => {
    expect(shouldTryWordAndNameMatch("Anthony Roxas", 0)).toBe(true);
  });

  it("is false when phrase already matched", () => {
    expect(shouldTryWordAndNameMatch("Anthony Roxas", 1)).toBe(false);
  });
});

describe("maxPostcodesForNearbyRadius", () => {
  it("allows more postcodes as radius grows", () => {
    expect(maxPostcodesForNearbyRadius(10)).toBeLessThan(maxPostcodesForNearbyRadius(25));
    expect(maxPostcodesForNearbyRadius(25)).toBeLessThan(maxPostcodesForNearbyRadius(50));
    expect(maxPostcodesForNearbyRadius(50)).toBeLessThanOrEqual(
      maxPostcodesForNearbyRadius(100)
    );
  });
});

describe("pickNearbySearchPostcodes", () => {
  const origin = { lat: -33.7, lng: 151.1, label: "Origin", source: "postcode" as const };
  const locationsMap: PostcodeLocationsMap = new Map(
    ["2076", "2000", "2010"].map((pc, i) => [
      pc,
      { lat: -33.7 + i * 0.5, lng: 151.1 + i * 0.5, suburb: `Suburb ${pc}` },
    ])
  );

  it("prefers postcodes nearest the origin when capped", () => {
    const picked = pickNearbySearchPostcodes(["2010", "2000", "2076"], 25, origin, locationsMap);
    expect(picked[0]).toBe("2076");
  });

  it("returns at least as many slots for 50km as 25km when many postcodes in range", () => {
    const postcodes = Array.from({ length: 80 }, (_, i) => String(2000 + i));
    const at25 = pickNearbySearchPostcodes(postcodes, 25, origin, locationsMap);
    const at50 = pickNearbySearchPostcodes(postcodes, 50, origin, locationsMap);
    expect(at50.length).toBeGreaterThanOrEqual(at25.length);
  });
});
