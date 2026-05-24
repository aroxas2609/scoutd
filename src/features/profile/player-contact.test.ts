import { describe, expect, it } from "vitest";
import {
  playerContactEmail,
  playerContactPhone,
  playerHasContactDetails,
  telHref,
} from "./player-contact";
import type { PlayerProfile } from "@/types/database";

function minimalPlayer(
  overrides: Partial<PlayerProfile> & { profiles?: PlayerProfile["profiles"] } = {}
): PlayerProfile {
  return {
    user_id: "p1",
    cover_url: null,
    age: null,
    date_of_birth: null,
    suburb: null,
    postcode: null,
    location: null,
    location_public: null,
    latitude: null,
    longitude: null,
    position: null,
    secondary_positions: [],
    dominant_foot: null,
    height_cm: null,
    current_club: null,
    experience_level: null,
    availability: null,
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
    ...overrides,
  };
}

describe("playerContactEmail", () => {
  it("prefers contact_email over account email", () => {
    const player = minimalPlayer({
      contact_email: "contact@scoutd.test",
      profiles: {
        id: "p1",
        role: "player",
        email: "account@scoutd.test",
        full_name: "Test",
        avatar_url: null,
        created_at: "",
        last_active_at: null,
        onboarding_complete: true,
      },
    });
    expect(playerContactEmail(player)).toBe("contact@scoutd.test");
  });

  it("falls back to profiles.email", () => {
    const player = minimalPlayer({
      profiles: {
        id: "p1",
        role: "player",
        email: "account@scoutd.test",
        full_name: null,
        avatar_url: null,
        created_at: "",
        last_active_at: null,
        onboarding_complete: true,
      },
    });
    expect(playerContactEmail(player)).toBe("account@scoutd.test");
  });
});

describe("playerContactPhone", () => {
  it("returns trimmed phone", () => {
    expect(playerContactPhone(minimalPlayer({ contact_phone: " 0412 345 678 " }))).toBe(
      "0412 345 678"
    );
  });
});

describe("playerHasContactDetails", () => {
  it("is true when email or phone exists", () => {
    expect(playerHasContactDetails(minimalPlayer({ contact_phone: "0412345678" }))).toBe(true);
  });
});

describe("telHref", () => {
  it("strips spaces for tel links", () => {
    expect(telHref("04 12 345 678")).toBe("tel:0412345678");
  });
});
