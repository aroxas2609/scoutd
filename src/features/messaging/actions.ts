"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canStartConversation } from "@/lib/auth/recruitment-permissions";
import { getOrCreateDirectConversation } from "./repository";

export async function startConversation(otherUserId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const permission = await canStartConversation(supabase, user.id, otherUserId);
  if (!permission.allowed) {
    redirect(`/messages?error=${encodeURIComponent(permission.error)}`);
  }

  const { conversationId, error } = await getOrCreateDirectConversation(
    supabase,
    user.id,
    otherUserId
  );

  if (error || !conversationId) {
    redirect(`/messages?error=${encodeURIComponent(error ?? "Could not start chat")}`);
  }

  redirect(`/messages/${conversationId}`);
}
