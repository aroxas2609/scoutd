import { normalisePostcode } from "@/lib/football/association-postcodes";
import type { CoachProfile, PlayerProfile, PlayerWithDistance } from "@/types/database";

export type PostcodeLocationEntry = {
  lat: number;
  lng: number;
  suburb?: string | null;
};

export type PostcodeLocationsMap = Map<string, PostcodeLocationEntry>;

export type SearchLocation = {
  lat: number;
  lng: number;
  label: string;
  source: "profile" | "postcode" | "district";
};

export type AssociationPostcodesMap = Map<string, string[]>;

const EARTH_RADIUS_KM = 6371;

/** Approximate lat/lng bounds for a radius search (cheap pre-filter before haversine). */
export function getLatLngBoundingBox(lat: number, lng: number, radiusKm: number) {
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_KM * c * 10) / 10;
}

export function getLocationFromPostcode(
  postcode: string | null | undefined,
  locationsMap: PostcodeLocationsMap,
  suburb?: string | null
): SearchLocation | null {
  const normalised = normalisePostcode(postcode);
  if (!normalised) return null;
  const entry = locationsMap.get(normalised);
  if (!entry) return null;
  const label = suburb?.trim()
    ? `${suburb.trim()}, ${normalised}`
    : entry.suburb
      ? `${entry.suburb}, ${normalised}`
      : normalised;
  return {
    lat: entry.lat,
    lng: entry.lng,
    label,
    source: "postcode",
  };
}

/** Match suburb name against seeded postcode_locations rows. */
export function getLocationFromSuburbName(
  suburb: string | null | undefined,
  locationsMap: PostcodeLocationsMap
): SearchLocation | null {
  const term = suburb?.trim().toLowerCase();
  if (!term) return null;
  for (const [postcode, entry] of locationsMap) {
    if (entry.suburb?.trim().toLowerCase() === term) {
      return getLocationFromPostcode(postcode, locationsMap, entry.suburb);
    }
  }
  return null;
}

/** Resolve location from free-text suburb/postcode in profile location fields. */
export function getLocationFromFreeText(
  location: string | null | undefined,
  locationsMap: PostcodeLocationsMap
): SearchLocation | null {
  const text = location?.trim().toLowerCase();
  if (!text) return null;

  const postcodeMatch = text.match(/\b(\d{4})\b/);
  if (postcodeMatch) {
    const fromPostcode = getLocationFromPostcode(postcodeMatch[1], locationsMap);
    if (fromPostcode) return fromPostcode;
  }

  for (const [postcode, entry] of locationsMap) {
    const suburb = entry.suburb?.trim().toLowerCase();
    if (suburb && text.includes(suburb)) {
      return getLocationFromPostcode(postcode, locationsMap, entry.suburb);
    }
  }

  return null;
}

/** Postcodes whose centroids fall within radiusKm of the search origin. */
export function getPostcodesWithinRadius(
  origin: SearchLocation,
  radiusKm: number,
  locationsMap: PostcodeLocationsMap
): string[] {
  const postcodes: string[] = [];
  for (const [postcode, entry] of locationsMap) {
    const distanceKm = calculateDistanceKm(
      origin.lat,
      origin.lng,
      entry.lat,
      entry.lng
    );
    if (distanceKm <= radiusKm) postcodes.push(postcode);
  }
  return postcodes;
}

/** Ensure the club/player postcode is always considered for nearby SQL filters. */
export function withOriginPostcode(
  postcodes: string[],
  originPostcode: string | null | undefined
): string[] {
  const normalised = normalisePostcode(originPostcode);
  if (!normalised || postcodes.includes(normalised)) return postcodes;
  return [...postcodes, normalised];
}

export function getSuburbsForPostcodes(
  postcodes: string[],
  locationsMap: PostcodeLocationsMap
): string[] {
  const suburbs = new Set<string>();
  for (const pc of postcodes) {
    const suburb = locationsMap.get(pc)?.suburb?.trim();
    if (suburb) suburbs.add(suburb);
  }
  return [...suburbs];
}

export function getAssociationCentroid(
  associationId: string | null | undefined,
  locationsMap: PostcodeLocationsMap,
  associationPostcodes: AssociationPostcodesMap
): SearchLocation | null {
  if (!associationId) return null;
  const postcodes = associationPostcodes.get(associationId) ?? [];
  if (!postcodes.length) return null;

  let latSum = 0;
  let lngSum = 0;
  let count = 0;
  for (const pc of postcodes) {
    const entry = locationsMap.get(pc);
    if (!entry) continue;
    latSum += entry.lat;
    lngSum += entry.lng;
    count++;
  }
  if (!count) return null;

  return {
    lat: latSum / count,
    lng: lngSum / count,
    label: "Your district",
    source: "district",
  };
}

type LocationProfile = {
  latitude?: number | null;
  longitude?: number | null;
  postcode?: string | null;
  suburb?: string | null;
  association_id?: string | null;
};

function fromProfileCoords(
  profile: LocationProfile,
  labelParts: string[]
): SearchLocation | null {
  if (profile.latitude == null || profile.longitude == null) return null;
  const label =
    labelParts.filter(Boolean).join(", ") ||
    `${profile.latitude.toFixed(4)}, ${profile.longitude.toFixed(4)}`;
  return {
    lat: profile.latitude,
    lng: profile.longitude,
    label,
    source: "profile",
  };
}

export function getCoachSearchLocation(
  coach: LocationProfile & {
    location?: string | null;
    location_public?: string | null;
  },
  locationsMap: PostcodeLocationsMap,
  associationPostcodes: AssociationPostcodesMap
): SearchLocation | null {
  const labelParts = [coach.suburb?.trim(), coach.postcode?.trim()].filter(Boolean) as string[];
  const freeText = coach.location_public ?? coach.location;
  return (
    getLocationFromPostcode(coach.postcode, locationsMap, coach.suburb) ??
    getLocationFromSuburbName(coach.suburb, locationsMap) ??
    getLocationFromFreeText(freeText, locationsMap) ??
    fromProfileCoords(coach, labelParts) ??
    getAssociationCentroid(coach.association_id, locationsMap, associationPostcodes)
  );
}

export function getPlayerSearchLocation(
  player: LocationProfile & {
    location?: string | null;
    location_public?: string | null;
  },
  locationsMap: PostcodeLocationsMap,
  associationPostcodes: AssociationPostcodesMap
): SearchLocation | null {
  const labelParts = [player.suburb?.trim(), player.postcode?.trim()].filter(Boolean) as string[];
  const freeText = player.location_public ?? player.location;
  return (
    getLocationFromPostcode(player.postcode, locationsMap, player.suburb) ??
    getLocationFromSuburbName(player.suburb, locationsMap) ??
    getLocationFromFreeText(freeText, locationsMap) ??
    fromProfileCoords(player, labelParts) ??
    getAssociationCentroid(player.association_id, locationsMap, associationPostcodes)
  );
}

export function filterPlayersByRadius(
  players: PlayerProfile[],
  coachLocation: SearchLocation,
  radiusKm: number,
  locationsMap: PostcodeLocationsMap,
  associationPostcodes: AssociationPostcodesMap
): PlayerWithDistance[] {
  const within: PlayerWithDistance[] = [];
  for (const player of players) {
    const playerLoc = getPlayerSearchLocation(player, locationsMap, associationPostcodes);
    if (!playerLoc) continue;
    const distanceKm = calculateDistanceKm(
      coachLocation.lat,
      coachLocation.lng,
      playerLoc.lat,
      playerLoc.lng
    );
    if (distanceKm <= radiusKm) {
      within.push({ ...player, distanceKm });
    }
  }
  return within;
}

export function sortPlayersByDistance(players: PlayerWithDistance[]): PlayerWithDistance[] {
  return [...players].sort((a, b) => {
    const da = a.distanceKm ?? Infinity;
    const db = b.distanceKm ?? Infinity;
    return da - db;
  });
}

export const RADIUS_OPTIONS_KM = [5, 10, 25, 50, 100] as const;
export type RadiusKm = (typeof RADIUS_OPTIONS_KM)[number];

export function isRadiusKm(value: number): value is RadiusKm {
  return (RADIUS_OPTIONS_KM as readonly number[]).includes(value);
}

export const DEFAULT_RADIUS_KM: RadiusKm = 25;
