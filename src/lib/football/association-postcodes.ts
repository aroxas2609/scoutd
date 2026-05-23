import type { PlayerProfile } from "@/types/database";

const AU_POSTCODE_RE = /^\d{4}$/;

export function normalisePostcode(postcode: string | null | undefined): string | null {
  if (!postcode?.trim()) return null;
  const digits = postcode.replace(/\D/g, "");
  if (digits.length !== 4) return null;
  return digits;
}

export function filterPlayersByPostcode(
  players: PlayerProfile[],
  postcode: string | null | undefined
): PlayerProfile[] {
  const normalised = normalisePostcode(postcode);
  if (!normalised) return players;
  return players.filter((p) => normalisePostcode(p.postcode) === normalised);
}

export function filterPlayersBySuburb(
  players: PlayerProfile[],
  suburb: string | null | undefined
): PlayerProfile[] {
  const term = suburb?.trim().toLowerCase();
  if (!term) return players;
  return players.filter((p) => {
    const playerSuburb = p.suburb?.trim().toLowerCase();
    if (playerSuburb?.includes(term)) return true;
    const location = p.location_public?.toLowerCase() ?? p.location?.toLowerCase() ?? "";
    return location.includes(term);
  });
}

export function isValidAustralianPostcode(postcode: string | null | undefined): boolean {
  return normalisePostcode(postcode) !== null;
}

export function isAustralianPostcodeQuery(value: string): boolean {
  return AU_POSTCODE_RE.test(value.trim());
}
