import { NextResponse } from "next/server";
import {
  abbreviateAustralianState,
  formatAustraliaLocationLabel,
  type AustraliaLocationOption,
} from "@/lib/location/australia";

type PhotonFeature = {
  properties: {
    osm_id?: number;
    name?: string;
    city?: string;
    state?: string;
    postcode?: string;
    countrycode?: string;
    osm_value?: string;
  };
};

/** Suburbs and localities only — no businesses, landmarks, or POIs. */
const SUBURB_PLACE_TYPES = new Set([
  "suburb",
  "locality",
  "town",
  "village",
  "hamlet",
  "neighbourhood",
]);

const AU_POSTCODE_RE = /^\d{4}$/;

function pushLocation(
  results: AustraliaLocationOption[],
  seen: Set<string>,
  option: AustraliaLocationOption
) {
  const key = `${option.suburb.toLowerCase()}|${option.state}|${option.postcode}`;
  if (seen.has(key)) return;
  seen.add(key);
  results.push(option);
  return results.length >= 8;
}

function isValidSuburbName(name: string): boolean {
  if (!name || /^\d{4}$/.test(name)) return false;
  if (name.length > 48) return false;
  return true;
}

async function searchPhoton(
  q: string,
  isPostcodeQuery: boolean,
  results: AustraliaLocationOption[],
  seen: Set<string>
) {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", isPostcodeQuery ? `${q}, Australia` : q);
  url.searchParams.set("limit", isPostcodeQuery ? "50" : "20");
  url.searchParams.set("lang", "en");
  if (isPostcodeQuery) {
    url.searchParams.set("countrycode", "au");
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers: { "User-Agent": "Scoutd/1.0 (location search)" },
      next: { revalidate: 3600 },
    });
  } catch {
    return;
  }

  if (!res.ok) return;

  const body = (await res.json()) as { features?: PhotonFeature[] };

  for (const feature of body.features ?? []) {
    const p = feature.properties;
    if (p.countrycode !== "AU") continue;

    const osmType = p.osm_value?.toLowerCase() ?? "";
    if (!SUBURB_PLACE_TYPES.has(osmType)) continue;

    const postcode = p.postcode?.trim() ?? "";
    const suburb = (p.name || p.city)?.trim() ?? "";

    if (!postcode || !AU_POSTCODE_RE.test(postcode)) continue;
    if (!isValidSuburbName(suburb)) continue;
    if (isPostcodeQuery && postcode !== q) continue;

    const state = abbreviateAustralianState(p.state);
    if (!state) continue;

    const option: AustraliaLocationOption = {
      id: String(p.osm_id ?? `${suburb}|${state}|${postcode}`),
      suburb,
      state,
      postcode,
      label: formatAustraliaLocationLabel(suburb, state, postcode),
    };

    if (pushLocation(results, seen, option)) return;
  }
}

async function searchZippopotam(
  postcode: string,
  results: AustraliaLocationOption[],
  seen: Set<string>
) {
  let res: Response;
  try {
    res = await fetch(`https://api.zippopotam.us/AU/${postcode}`, {
      headers: { "User-Agent": "Scoutd/1.0 (location search)" },
      next: { revalidate: 86400 },
    });
  } catch {
    return;
  }

  if (!res.ok) return;

  const body = (await res.json()) as {
    places?: { "place name"?: string; state?: string; "state abbreviation"?: string }[];
  };

  for (const [index, place] of (body.places ?? []).entries()) {
    const suburb = place["place name"]?.trim();
    if (!isValidSuburbName(suburb ?? "")) continue;

    const state = abbreviateAustralianState(
      place["state abbreviation"] || place.state
    );
    if (!state) continue;

    const option: AustraliaLocationOption = {
      id: `zip-${postcode}-${index}`,
      suburb: suburb!,
      state,
      postcode,
      label: formatAustraliaLocationLabel(suburb!, state, postcode),
    };

    if (pushLocation(results, seen, option)) return;
  }
}

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const isPostcodeQuery = AU_POSTCODE_RE.test(q);
  const seen = new Set<string>();
  const results: AustraliaLocationOption[] = [];

  if (isPostcodeQuery) {
    await searchZippopotam(q, results, seen);
  }

  await searchPhoton(q, isPostcodeQuery, results, seen);

  return NextResponse.json(results);
}
