import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { autoAssignAssociationFromPostcode } from "@/features/associations/repository";
import { normalisePostcode } from "@/lib/football/association-postcodes";

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("postcode")?.trim() ?? "";
  const postcode = normalisePostcode(raw);

  if (!postcode) {
    return NextResponse.json({});
  }

  const supabase = await createClient();
  const suggestion = await autoAssignAssociationFromPostcode(supabase, postcode);

  if (!suggestion) {
    return NextResponse.json({});
  }

  return NextResponse.json(suggestion);
}
