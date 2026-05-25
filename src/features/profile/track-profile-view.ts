"use server";

import { createClient } from "@/lib/supabase/server";

/** Single round-trip for coach profile views (replaces two client inserts). */
export async function trackPlayerProfileView(viewedId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id === viewedId) return { ok: true as const };

  const { data: viewerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (viewerProfile?.role !== "coach") {
    return { ok: true as const };
  }

  const { error: viewError } = await supabase.from("profile_views").insert({
    viewer_id: user.id,
    viewed_id: viewedId,
  });

  if (viewError) return { error: viewError.message };

  const { error: notifyError } = await supabase.from("notifications").insert({
    user_id: viewedId,
    type: "profile_viewed",
    title: "Profile viewed",
    body: "A coach viewed your profile",
    metadata: { viewer_id: user.id },
  });

  if (notifyError) return { error: notifyError.message };

  return { ok: true as const };
}
