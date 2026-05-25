"use server";

import { createClient } from "@/lib/supabase/server";
import type { PushSubscriptionPayload } from "./subscribe";

export async function savePushSubscription(payload: PushSubscriptionPayload) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" as const };

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: payload.endpoint,
      p256dh: payload.p256dh,
      auth: payload.auth,
      user_agent: payload.userAgent,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" }
  );

  if (error) return { error: error.message };
  return { success: true as const };
}

export async function removePushSubscription(endpoint: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" as const };

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);

  if (error) return { error: error.message };
  return { success: true as const };
}

export async function listPushSubscriptions() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [] as { endpoint: string }[] };

  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint")
    .eq("user_id", user.id);

  if (error) return { error: error.message, data: [] as { endpoint: string }[] };
  return { data: data ?? [] };
}
