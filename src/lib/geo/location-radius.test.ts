import { describe, expect, it } from "vitest";
import { getLatLngBoundingBox } from "./location-radius";

describe("getLatLngBoundingBox", () => {
  it("expands bounds with radius", () => {
    const box = getLatLngBoundingBox(-33.87, 151.21, 25);
    expect(box.minLat).toBeLessThan(-33.87);
    expect(box.maxLat).toBeGreaterThan(-33.87);
    expect(box.minLng).toBeLessThan(151.21);
    expect(box.maxLng).toBeGreaterThan(151.21);
  });
});
