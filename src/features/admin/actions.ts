"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function resolveReport(reportId: string, status: "resolved" | "dismissed") {
  const supabase = await createServiceClient();
  const { error } = await supabase
    .from("reports")
    .update({ status })
    .eq("id", reportId);
  if (error) return { error: error.message };
  revalidatePath("/admin/reports");
  return { success: true };
}

export async function resolveReportAction(reportId: string, status: "resolved" | "dismissed") {
  await resolveReport(reportId, status);
}

export async function updateVerificationAction(
  requestId: string,
  status: "approved" | "rejected"
) {
  await updateVerification(requestId, status);
}

export async function updateVerification(
  requestId: string,
  status: "approved" | "rejected"
) {
  const supabase = await createServiceClient();
  const { data: req } = await supabase
    .from("verification_requests")
    .select("user_id, role")
    .eq("id", requestId)
    .single();

  if (!req) return { error: "Request not found" };

  await supabase
    .from("verification_requests")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", requestId);

  if (status === "approved") {
    const table = req.role === "player" ? "player_profiles" : "coach_profiles";
    await supabase
      .from(table)
      .update({ verified_at: new Date().toISOString() })
      .eq("user_id", req.user_id);
  }

  revalidatePath("/admin/verification");
  return { success: true };
}

export async function setFeatured(
  entityType: "player" | "club",
  entityId: string,
  sortOrder: number
) {
  const supabase = await createServiceClient();
  const { error } = await supabase.from("featured_entities").upsert({
    entity_type: entityType,
    entity_id: entityId,
    sort_order: sortOrder,
    active_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/featured");
  return { success: true };
}
