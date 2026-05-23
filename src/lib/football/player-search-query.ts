import { isValidAustralianPostcode, normalisePostcode } from "@/lib/football/association-postcodes";
import type { PostcodeLocationsMap } from "@/lib/geo/location-radius";
import { getSuburbsForPostcodes } from "@/lib/geo/location-radius";

/** Strip characters that break PostgREST ilike patterns. */
export function escapeIlikePattern(value: string): string {
  return value.replace(/[%_\\]/g, "");
}

export function buildPlayerSuburbOrClause(term: string): string | null {
  const q = escapeIlikePattern(term.trim());
  if (!q) return null;
  return [`suburb.ilike.%${q}%`, `location_public.ilike.%${q}%`, `location.ilike.%${q}%`].join(
    ","
  );
}

export function buildPlayerLocationOrClause(term: string): string | null {
  const suburbClause = buildPlayerSuburbOrClause(term);
  const q = escapeIlikePattern(term.trim());
  if (!q) return suburbClause;

  const parts = [`current_club.ilike.%${q}%`];
  if (suburbClause) parts.push(suburbClause);

  if (isValidAustralianPostcode(q)) {
    parts.push(`postcode.eq.${normalisePostcode(q)}`);
  }

  return parts.join(",");
}

/** PostgREST OR filter for nearby player fetch (postcode, suburb, legacy location text). */
export function buildNearbyPlayersOrClause(
  postcodes: string[],
  locationsMap: PostcodeLocationsMap
): string | null {
  if (!postcodes.length) return null;

  const parts: string[] = [`postcode.in.(${postcodes.join(",")})`];

  const suburbs = getSuburbsForPostcodes(postcodes, locationsMap);
  if (suburbs.length > 0) {
    const suburbValues = suburbs
      .map((s) => (/\s/.test(s) ? `"${s.replace(/"/g, "")}"` : s))
      .join(",");
    parts.push(`suburb.in.(${suburbValues})`);
  }

  for (const pc of postcodes.slice(0, 12)) {
    parts.push(`location.ilike.%${pc}%`, `location_public.ilike.%${pc}%`);
  }

  return parts.join(",");
}

export function buildPlayerSearchOrClause(
  term: string,
  nameMatchUserIds: string[]
): string | null {
  const locationClause = buildPlayerLocationOrClause(term);
  const parts = locationClause ? [locationClause] : [];

  if (nameMatchUserIds.length > 0) {
    parts.push(`user_id.in.(${nameMatchUserIds.join(",")})`);
  }

  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0]!;
  return parts.join(",");
}
