import { isValidAustralianPostcode, normalisePostcode } from "@/lib/football/association-postcodes";

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
