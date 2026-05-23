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
  coach: LocationProfile,
  locationsMap: PostcodeLocationsMap,
  associationPostcodes: AssociationPostcodesMap
): SearchLocation | null {
  const labelParts = [coach.suburb?.trim(), coach.postcode?.trim()].filter(Boolean) as string[];
  return (
    fromProfileCoords(coach, labelParts) ??
    getLocationFromPostcode(coach.postcode, locationsMap, coach.suburb) ??
    getAssociationCentroid(coach.association_id, locationsMap, associationPostcodes)
  );
}

export function getPlayerSearchLocation(
  player: LocationProfile,
  locationsMap: PostcodeLocationsMap,
  associationPostcodes: AssociationPostcodesMap
): SearchLocation | null {
  const labelParts = [player.suburb?.trim(), player.postcode?.trim()].filter(Boolean) as string[];
  return (
    fromProfileCoords(player, labelParts) ??
    getLocationFromPostcode(player.postcode, locationsMap, player.suburb) ??
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
