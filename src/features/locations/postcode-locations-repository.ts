import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AssociationPostcodesMap,
  PostcodeLocationsMap,
} from "@/lib/geo/location-radius";
import { normalisePostcode } from "@/lib/football/association-postcodes";
import type { PostcodeLocation } from "@/types/database";

export async function listPostcodeLocations(
  supabase: SupabaseClient
): Promise<PostcodeLocationsMap> {
  const { data, error } = await supabase
    .from("postcode_locations")
    .select("postcode, suburb, latitude, longitude");

  if (error) throw error;

  const map: PostcodeLocationsMap = new Map();
  for (const row of (data ?? []) as PostcodeLocation[]) {
    const postcode = normalisePostcode(row.postcode);
    if (!postcode || row.latitude == null || row.longitude == null) continue;
    map.set(postcode, {
      lat: row.latitude,
      lng: row.longitude,
      suburb: row.suburb,
    });
  }
  return map;
}

export async function getAssociationPostcodeMap(
  supabase: SupabaseClient
): Promise<AssociationPostcodesMap> {
  const { data, error } = await supabase
    .from("association_postcodes")
    .select("association_id, postcode");

  if (error) throw error;

  const map: AssociationPostcodesMap = new Map();
  for (const row of data ?? []) {
    const associationId = row.association_id as string;
    const postcode = normalisePostcode(row.postcode as string);
    if (!postcode) continue;
    const list = map.get(associationId) ?? [];
    if (!list.includes(postcode)) list.push(postcode);
    map.set(associationId, list);
  }
  return map;
}
