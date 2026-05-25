import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { canStartConversation, canSendTrialInvite } from "./recruitment-permissions";

vi.mock("@/features/messaging/repository", () => ({
  findDirectConversation: vi.fn(),
}));

function mockSupabase(roles: Record<string, string | null>): SupabaseClient {
  return {
    from: () => ({
      select: () => ({
        eq: (_col: string, id: string) => ({
          single: async () => ({ data: { role: roles[id] ?? null } }),
        }),
      }),
    }),
  } as unknown as SupabaseClient;
}

describe("canStartConversation", () => {
  it("blocks messaging yourself", async () => {
    const supabase = mockSupabase({ u1: "player" });
    const result = await canStartConversation(supabase, "u1", "u1");
    expect(result).toEqual({ allowed: false, error: "Cannot message yourself" });
  });

  it("allows coach to message player", async () => {
    const supabase = mockSupabase({ coach: "coach", player: "player" });
    const result = await canStartConversation(supabase, "coach", "player");
    expect(result).toEqual({ allowed: true });
  });

  it("allows player to message coach", async () => {
    const supabase = mockSupabase({ coach: "coach", player: "player" });
    const result = await canStartConversation(supabase, "player", "coach");
    expect(result).toEqual({ allowed: true });
  });

  it("allows player to message another player", async () => {
    const supabase = mockSupabase({ p1: "player", p2: "player" });
    const result = await canStartConversation(supabase, "p1", "p2");
    expect(result).toEqual({ allowed: true });
  });

  it("blocks unsupported role pairs", async () => {
    const supabase = mockSupabase({ admin: "admin", player: "player" });
    const result = await canStartConversation(supabase, "admin", "player");
    expect(result.allowed).toBe(false);
  });
});

describe("canSendTrialInvite", () => {
  it("allows coach to invite player", async () => {
    const supabase = mockSupabase({ coach: "coach", player: "player" });
    const result = await canSendTrialInvite(supabase, "coach", "player");
    expect(result).toEqual({ allowed: true });
  });

  it("blocks player from sending trial invite", async () => {
    const supabase = mockSupabase({ p1: "player", p2: "player" });
    const result = await canSendTrialInvite(supabase, "p1", "p2");
    expect(result.allowed).toBe(false);
  });
});
