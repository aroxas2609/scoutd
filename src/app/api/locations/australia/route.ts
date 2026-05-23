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

const PLACE_TYPES = new Set([
  "suburb",
  "locality",
  "town",
  "village",
  "hamlet",
  "neighbourhood",
  "city",
  "district",
]);

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "15");
  url.searchParams.set("lang", "en");

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers: { "User-Agent": "Scoutd/1.0 (location search)" },
      next: { revalidate: 3600 },
    });
  } catch {
    return NextResponse.json([], { status: 502 });
  }

  if (!res.ok) {
    return NextResponse.json([], { status: 502 });
  }

  const body = (await res.json()) as { features?: PhotonFeature[] };
  const seen = new Set<string>();
  const results: AustraliaLocationOption[] = [];

  for (const feature of body.features ?? []) {
    const p = feature.properties;
    if (p.countrycode !== "AU") continue;

    const postcode = p.postcode?.trim();
    if (!postcode || !/^\d{4}$/.test(postcode)) continue;

    const osmType = p.osm_value?.toLowerCase() ?? "";
    if (!PLACE_TYPES.has(osmType)) continue;

    const suburb = (p.name || p.city)?.trim();
    if (!suburb) continue;

    const state = abbreviateAustralianState(p.state);
    if (!state) continue;

    const key = `${suburb.toLowerCase()}|${state}|${postcode}`;
    if (seen.has(key)) continue;
    seen.add(key);

    results.push({
      id: String(p.osm_id ?? key),
      suburb,
      state,
      postcode,
      label: formatAustraliaLocationLabel(suburb, state, postcode),
    });

    if (results.length >= 8) break;
  }

  return NextResponse.json(results);
}
