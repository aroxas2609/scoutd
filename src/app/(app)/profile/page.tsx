import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProfileIndexPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "coach") {
    redirect(`/profile/coach/${user.id}`);
  }
  redirect(`/profile/player/${user.id}`);
}
