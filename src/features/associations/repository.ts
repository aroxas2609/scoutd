import type { SupabaseClient } from "@supabase/supabase-js";
import { normalisePostcode } from "@/lib/football/association-postcodes";
import type { Association, AssociationPostcode } from "@/types/database";

export type AssociationSuggestion = {
  associationId: string;
  associationName: string;
};

export async function listAssociations(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("associations")
    .select("*")
    .order("name", { ascending: true });
  return { data: data as Association[] | null, error };
}

export async function resolveAssociationIdByName(
  supabase: SupabaseClient,
  name: string | null | undefined
) {
  const trimmed = name?.trim();
  if (!trimmed) return { id: null as string | null, error: null };

  const { data, error } = await supabase
    .from("associations")
    .select("id")
    .eq("name", trimmed)
    .maybeSingle();

  return { id: (data?.id as string | undefined) ?? null, error };
}

export async function getAssociationByPostcode(
  supabase: SupabaseClient,
  postcode: string | null | undefined
): Promise<AssociationSuggestion | null> {
  const normalised = normalisePostcode(postcode);
  if (!normalised) return null;

  const { data, error } = await supabase
    .from("association_postcodes")
    .select("association_id, associations(id, name)")
    .eq("postcode", normalised)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const raw = data.associations as
    | { id: string; name: string }
    | { id: string; name: string }[]
    | null;
  const association = Array.isArray(raw) ? raw[0] : raw;
  if (!association?.id || !association?.name) return null;

  return {
    associationId: association.id,
    associationName: association.name,
  };
}

export async function getPostcodesByAssociation(
  supabase: SupabaseClient,
  associationId: string
) {
  const { data, error } = await supabase
    .from("association_postcodes")
    .select("*")
    .eq("association_id", associationId)
    .order("postcode", { ascending: true });

  return { data: data as AssociationPostcode[] | null, error };
}

export async function autoAssignAssociationFromPostcode(
  supabase: SupabaseClient,
  postcode: string | null | undefined
): Promise<AssociationSuggestion | null> {
  return getAssociationByPostcode(supabase, postcode);
}
