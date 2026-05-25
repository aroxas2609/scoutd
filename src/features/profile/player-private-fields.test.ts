import { describe, expect, it } from "vitest";
import {
  canViewPlayerFfaNumber,
  playerFfaNumber,
  redactPlayerPrivateFields,
  redactPlayerList,
} from "./player-private-fields";
import type { PlayerProfile } from "@/types/database";

function minimalPlayer(overrides: Partial<PlayerProfile> = {}): PlayerProfile {
  return {
    user_id: "p1",
    cover_url: null,
    age: 18,
    date_of_birth: null,
    suburb: null,
    postcode: null,
    location: null,
    location_public: null,
    latitude: null,
    longitude: null,
    position: "CM",
    secondary_positions: [],
    dominant_foot: "right",
    height_cm: null,
    current_club: null,
    experience_level: "amateur",
    availability: "available",
    bio: null,
    achievements: [],
    social_links: {},
    playing_level: null,
    willing_to_travel: false,
    gender: null,
    completion_score: 0,
    verified_at: null,
    featured_until: null,
    has_highlights: false,
    association_id: null,
    contact_email: null,
    contact_phone: null,
    ffa_number: "12345",
    ...overrides,
  };
}

describe("player private fields", () => {
  it("allows coaches and admins to view FFA#", () => {
    expect(canViewPlayerFfaNumber("coach")).toBe(true);
    expect(canViewPlayerFfaNumber("admin")).toBe(true);
    expect(canViewPlayerFfaNumber("player")).toBe(false);
    expect(canViewPlayerFfaNumber(null)).toBe(false);
  });

  it("redacts FFA# for non-coach viewers", () => {
    const redacted = redactPlayerPrivateFields(minimalPlayer(), "player");
    expect(redacted.ffa_number).toBeNull();
    expect(playerFfaNumber(redacted)).toBeNull();
  });

  it("keeps FFA# for coach viewers", () => {
    const kept = redactPlayerPrivateFields(minimalPlayer(), "coach");
    expect(playerFfaNumber(kept)).toBe("12345");
  });

  it("redacts lists in bulk", () => {
    const list = redactPlayerList([minimalPlayer()], "player");
    expect(list[0]?.ffa_number).toBeNull();
  });
});
