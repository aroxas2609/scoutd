"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { setUserRole } from "./actions";
import type { UserRole } from "@/types/database";

export async function selectRole(role: UserRole) {
  await setUserRole(role);
}

/** Lets users leave onboarding step 1 and pick player vs coach again. */
export async function goBackToRoleSelection() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .update({ role: null })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  redirect("/role");
}
