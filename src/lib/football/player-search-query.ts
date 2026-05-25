import { isValidAustralianPostcode, normalisePostcode } from "@/lib/football/association-postcodes";
import {
  calculateDistanceKm,
  getSuburbsForPostcodes,
  type PostcodeLocationsMap,
  type SearchLocation,
} from "@/lib/geo/location-radius";

/** Strip characters that break PostgREST ilike patterns. */
export function escapeIlikePattern(value: string): string {
  return value.replace(/[%_\\]/g, "");
}

/** Split a search term into non-empty words (for multi-word name AND). */
export function splitSearchWords(term: string): string[] {
  return term.trim().split(/\s+/).filter(Boolean);
}

/** Use per-word AND name matching when phrase ilike found no profiles. */
export function shouldTryWordAndNameMatch(term: string, phraseMatchCount: number): boolean {
  return splitSearchWords(term).length > 1 && phraseMatchCount === 0;
}

/** Wrap OR-filter values that contain spaces or commas (PostgREST syntax). */
export function quotePostgrestOrPattern(pattern: string): string {
  if (/[\s,()]/.test(pattern)) {
    return `"${pattern.replace(/"/g, '""')}"`;
  }
  return pattern;
}

export function buildPlayerSuburbOrClause(term: string): string | null {
  const q = escapeIlikePattern(term.trim());
  if (!q) return null;
  return [
    `suburb.ilike.%${q}%`,
    `location_public.ilike.%${q}%`,
    `location.ilike.%${q}%`,
  ].join(",");
}

export function buildPlayerLocationOrClause(term: string): string | null {
  const q = escapeIlikePattern(term.trim());
  if (!q) return null;

  const parts = [
    `current_club.ilike.%${q}%`,
    `suburb.ilike.%${q}%`,
    `location_public.ilike.%${q}%`,
    `location.ilike.%${q}%`,
  ];

  if (isValidAustralianPostcode(q)) {
    parts.push(`postcode.eq.${normalisePostcode(q)}`);
  }

  return parts.join(",");
}

/** Upper bound for `.in("postcode", …)` (PostgREST request size). */
const MAX_POSTCODES_IN_NEARBY_FILTER = 80;

/** Larger radius → same or higher cap (never fewer postcodes than a smaller radius). */
export function maxPostcodesForNearbyRadius(radiusKm: number): number {
  if (radiusKm <= 10) return 40;
  if (radiusKm <= 25) return 55;
  if (radiusKm <= 50) return 70;
  return MAX_POSTCODES_IN_NEARBY_FILTER;
}

export function capPostcodesForNearbySearch(
  postcodes: string[],
  radiusKm: number
): string[] {
  return postcodes.slice(0, maxPostcodesForNearbyRadius(radiusKm));
}

/** Keep nearest postcodes first so wider radii include (not exclude) local matches. */
export function pickNearbySearchPostcodes(
  postcodes: string[],
  radiusKm: number,
  origin: SearchLocation,
  locationsMap: PostcodeLocationsMap
): string[] {
  const limit = Math.min(postcodes.length, maxPostcodesForNearbyRadius(radiusKm));

  const sorted = [...postcodes].sort((a, b) => {
    const entryA = locationsMap.get(a);
    const entryB = locationsMap.get(b);
    const distA = entryA
      ? calculateDistanceKm(origin.lat, origin.lng, entryA.lat, entryA.lng)
      : Number.POSITIVE_INFINITY;
    const distB = entryB
      ? calculateDistanceKm(origin.lat, origin.lng, entryB.lat, entryB.lng)
      : Number.POSITIVE_INFINITY;
    return distA - distB;
  });

  return sorted.slice(0, limit);
}

/** Legacy OR builder (tests only). */
export function buildNearbyPlayersOrClause(
  postcodes: string[],
  locationsMap: PostcodeLocationsMap
): string | null {
  const capped = capPostcodesForNearbySearch(postcodes, 10);
  if (!capped.length) return null;

  const parts: string[] = [`postcode.in.(${capped.join(",")})`];

  const suburbs = getSuburbsForPostcodes(capped, locationsMap);
  if (suburbs.length > 0) {
    const suburbValues = suburbs
      .map((s) => (/\s/.test(s) ? `"${s.replace(/"/g, "")}"` : s))
      .join(",");
    parts.push(`suburb.in.(${suburbValues})`);
  }

  for (const pc of capped.slice(0, 8)) {
    parts.push(`location.ilike.%${pc}%`, `location_public.ilike.%${pc}%`);
  }

  return parts.join(",");
}

/** PostgREST OR on player_profiles: location fields + optional profile name user ids. */
export function buildPlayerSearchOrClause(
  term: string,
  nameMatchUserIds: string[] = []
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
