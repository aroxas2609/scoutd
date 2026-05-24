"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { PageLoader } from "@/components/ui/page-loader";
import { createClient } from "@/lib/supabase/client";
import { getPostLoginRedirect } from "@/lib/auth/redirect-path";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [afterSuccess, setAfterSuccess] = useState("/search");
  const [status, setStatus] = useState<"loading" | "ready" | "unauthenticated">("loading");

  useEffect(() => {
    const supabase = createClient();

    async function establishSession() {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash) {
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!error) {
            window.history.replaceState(null, "", window.location.pathname);
          }
        }
      }

      for (let attempt = 0; attempt < 8; attempt++) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, onboarding_complete")
            .eq("id", session.user.id)
            .single();
          setAfterSuccess(getPostLoginRedirect(profile) ?? "/search");
          setStatus("ready");
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      setStatus("unauthenticated");
    }

    void establishSession();
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?redirect=/update-password");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <AuthPageShell>
        <PageLoader />
      </AuthPageShell>
    );
  }

  if (status !== "ready") {
    return null;
  }

  return (
    <AuthPageShell>
      <GlassCard className="w-full p-8">
        <h1 className="font-display text-2xl font-bold">Set a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a new password for your account.
        </p>
        <div className="mt-6">
          <ChangePasswordForm redirectOnSuccess={afterSuccess} />
        </div>
      </GlassCard>
    </AuthPageShell>
  );
}
