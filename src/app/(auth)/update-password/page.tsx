import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/glass-card";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { getPostLoginRedirect } from "@/lib/auth/redirect-path";

export default async function UpdatePasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/update-password");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarding_complete")
    .eq("id", user.id)
    .single();

  const afterSuccess = getPostLoginRedirect(profile) ?? "/search";

  return (
    <>
      <Link href="/" className="mb-8 block text-center font-display text-2xl font-bold">
        Scoutd
      </Link>
      <GlassCard className="p-8">
        <h1 className="font-display text-2xl font-bold">Set a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a new password for your account.
        </p>
        <div className="mt-6">
          <ChangePasswordForm redirectOnSuccess={afterSuccess} />
        </div>
      </GlassCard>
    </>
  );
}
