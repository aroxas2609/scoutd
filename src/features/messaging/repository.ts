import type { SupabaseClient } from "@supabase/supabase-js";

export async function findDirectConversation(
  supabase: SupabaseClient,
  userId: string,
  otherUserId: string
): Promise<string | null> {
  const { data: mine } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", userId);

  if (!mine?.length) return null;

  const ids = mine.map((r) => r.conversation_id);
  const { data: shared } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", otherUserId)
    .in("conversation_id", ids)
    .limit(1)
    .maybeSingle();

  return shared?.conversation_id ?? null;
}

export async function getOrCreateDirectConversation(
  supabase: SupabaseClient,
  userId: string,
  otherUserId: string
): Promise<{ conversationId: string; error?: string }> {
  if (userId === otherUserId) {
    return { conversationId: "", error: "Cannot message yourself" };
  }

  const existing = await findDirectConversation(supabase, userId, otherUserId);
  if (existing) return { conversationId: existing };

  // Prefer security-definer RPC (see 004_fix_conversations_insert.sql)
  const { data: rpcId, error: rpcError } = await supabase.rpc(
    "create_direct_conversation",
    { other_user_id: otherUserId }
  );

  if (!rpcError && rpcId) {
    return { conversationId: rpcId as string };
  }

  if (rpcError?.message?.includes("create_direct_conversation")) {
    return {
      conversationId: "",
      error:
        "Database not ready: run 004_fix_conversations_insert.sql in Supabase SQL Editor.",
    };
  }

  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .insert({ status: "pending" })
    .select("id")
    .single();

  if (convError || !conversation) {
    return {
      conversationId: "",
      error:
        convError?.message ??
        rpcError?.message ??
        "Could not create conversation. Run 004_fix_conversations_insert.sql in Supabase.",
    };
  }

  const { error: partError } = await supabase.from("conversation_participants").insert([
    { conversation_id: conversation.id, user_id: userId },
    { conversation_id: conversation.id, user_id: otherUserId },
  ]);

  if (partError) {
    return { conversationId: "", error: partError.message };
  }

  return { conversationId: conversation.id };
}
