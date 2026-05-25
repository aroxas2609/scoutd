import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

const RECENT_READ_SKIP_MS = 60_000;

type MessageRecord = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  type: string;
  created_at: string;
};

type WebhookPayload = {
  type?: string;
  table?: string;
  record?: MessageRecord;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function senderDisplayName(
  profile: { full_name: string | null; role: string | null },
  clubName: string | null
) {
  const name = profile.full_name?.trim();
  const club = clubName?.trim();
  if (profile.role === "coach") {
    if (club) return club;
    if (name) return name;
    return "Coach";
  }
  if (name) return name;
  if (profile.role === "player") return "Player";
  return "Scoutd";
}

function configureWebPush() {
  const publicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const privateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  const subject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:support@scoutd.app";
  if (!publicKey || !privateKey) {
    throw new Error("Missing VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY");
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const expectedSecret = Deno.env.get("PUSH_WEBHOOK_SECRET");
  const receivedSecret = req.headers.get("x-push-webhook-secret");
  if (!expectedSecret || receivedSecret !== expectedSecret) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  let payload: WebhookPayload;
  try {
    payload = (await req.json()) as WebhookPayload;
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const record = payload.record;
  if (payload.type !== "INSERT" || !record?.id || !record.conversation_id || !record.sender_id) {
    return jsonResponse({ skipped: true, reason: "not_a_message_insert" });
  }

  if (record.type !== "text") {
    return jsonResponse({ skipped: true, reason: "non_text_message" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Missing Supabase env" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: participants, error: participantsError } = await supabase
    .from("conversation_participants")
    .select("user_id, last_read_at")
    .eq("conversation_id", record.conversation_id);

  if (participantsError) {
    return jsonResponse({ error: participantsError.message }, 500);
  }

  const recipient = (participants ?? []).find((p) => p.user_id !== record.sender_id);
  if (!recipient?.user_id) {
    return jsonResponse({ skipped: true, reason: "no_recipient" });
  }

  const [{ data: senderProfile }, { data: senderCoach }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", record.sender_id)
      .maybeSingle(),
    supabase
      .from("coach_profiles")
      .select("club_name")
      .eq("user_id", record.sender_id)
      .maybeSingle(),
  ]);

  const senderLabel = senderProfile
    ? senderDisplayName(senderProfile, senderCoach?.club_name ?? null)
    : "Scoutd";
  const snippet = record.body.trim().slice(0, 120) || "New message";
  const metadata = {
    conversation_id: record.conversation_id,
    sender_id: record.sender_id,
    message_id: record.id,
  };

  const { error: notifyError } = await supabase.from("notifications").insert({
    user_id: recipient.user_id,
    type: "new_message",
    title: "New message",
    body: snippet,
    metadata,
  });

  if (notifyError && notifyError.code !== "23505") {
    return jsonResponse({ error: notifyError.message }, 500);
  }

  let skipPush = false;
  if (recipient.last_read_at) {
    const readAt = new Date(recipient.last_read_at).getTime();
    const messageAt = new Date(record.created_at).getTime();
    if (messageAt - readAt <= RECENT_READ_SKIP_MS) {
      skipPush = true;
    }
  }

  if (skipPush) {
    return jsonResponse({
      ok: true,
      notification: true,
      pushSent: 0,
      pushSkipped: true,
      reason: "recipient_recently_read",
    });
  }

  const { data: subscriptions, error: subsError } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", recipient.user_id);

  if (subsError) {
    return jsonResponse({ error: subsError.message }, 500);
  }

  if (!subscriptions?.length) {
    return jsonResponse({ ok: true, notification: true, pushSent: 0, pushSkipped: true });
  }

  try {
    configureWebPush();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return jsonResponse({ error: message }, 500);
  }

  const pushPayload = JSON.stringify({
    title: `Message from ${senderLabel}`,
    body: snippet,
    url: `/messages/${record.conversation_id}`,
    conversationId: record.conversation_id,
  });

  let sent = 0;
  const staleIds: string[] = [];

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        pushPayload
      );
      sent++;
    } catch (err: unknown) {
      const statusCode =
        err && typeof err === "object" && "statusCode" in err
          ? Number((err as { statusCode: number }).statusCode)
          : 0;
      if (statusCode === 404 || statusCode === 410) {
        staleIds.push(sub.id);
      }
    }
  }

  if (staleIds.length) {
    await supabase.from("push_subscriptions").delete().in("id", staleIds);
  }

  return jsonResponse({
    ok: true,
    notification: true,
    pushSent: sent,
    pushRemoved: staleIds.length,
  });
});
