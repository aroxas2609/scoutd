"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { PageLoader } from "@/components/ui/page-loader";
import { createClient } from "@/lib/supabase/client";
import { getAuthRedirectError } from "@/lib/auth/auth-redirect-errors";
import { getPostLoginRedirect } from "@/lib/auth/redirect-path";

const RECOVERY_FLAG = "scoutd-password-recovery";

function UpdatePasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [afterSuccess, setAfterSuccess] = useState("/search");
  const [status, setStatus] = useState<"loading" | "ready" | "unauthenticated">("loading");
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function establishSession() {
      const hash = window.location.hash.replace(/^#/, "");
      const redirectError = getAuthRedirectError(searchParams, hash);
      if (redirectError) {
        setAuthError(redirectError.message);
        setStatus("unauthenticated");
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }

      const code = searchParams.get("code");
      if (code) {
        window.location.replace(
          `/auth/callback?type=recovery&code=${encodeURIComponent(code)}`
        );
        return;
      }

      const tokenHash = searchParams.get("token_hash");
      const otpType = searchParams.get("type");
      if (tokenHash && otpType === "recovery") {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });
        if (error) {
          setAuthError(error.message);
          setStatus("unauthenticated");
          return;
        }
        sessionStorage.setItem(RECOVERY_FLAG, "1");
        window.history.replaceState(null, "", window.location.pathname);
      }

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
            sessionStorage.setItem(RECOVERY_FLAG, "1");
            window.history.replaceState(null, "", window.location.pathname);
          }
        }
      }

      for (let attempt = 0; attempt < 8; attempt++) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          const inRecovery = sessionStorage.getItem(RECOVERY_FLAG) === "1";
          if (inRecovery) {
            setAfterSuccess("/search");
          } else {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role, onboarding_complete")
              .eq("id", session.user.id)
              .single();
            setAfterSuccess(getPostLoginRedirect(profile) ?? "/search");
          }
          setStatus("ready");
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      setStatus("unauthenticated");
    }

    void establishSession();
  }, [searchParams]);

  useEffect(() => {
    if (status !== "unauthenticated") return;
    if (authError) return;
    router.replace("/login?redirect=/update-password");
  }, [status, router, searchParams, authError]);

  if (status === "loading") {
    return (
      <AuthPageShell>
        <PageLoader />
      </AuthPageShell>
    );
  }

  if (status === "unauthenticated") {
    return (
      <AuthPageShell>
        <GlassCard className="w-full p-8">
          <h1 className="font-display text-2xl font-bold">Reset link problem</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {authError ??
              "We could not start a password reset session. Request a new link and open it in the same browser where you submitted the form."}
          </p>
          <p className="mt-4 text-sm">
            <a href="/forgot-password" className="text-[var(--accent-brand)] underline">
              Request a new reset link
            </a>
            {" · "}
            <a href="/login" className="text-muted-foreground underline">
              Back to sign in
            </a>
          </p>
        </GlassCard>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell>
      <GlassCard className="w-full p-8">
        <h1 className="font-display text-2xl font-bold">Set a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a new password for your account.
        </p>
        <div className="mt-6">
          <ChangePasswordForm
            redirectOnSuccess={afterSuccess}
            onSuccess={() => sessionStorage.removeItem(RECOVERY_FLAG)}
          />
        </div>
      </GlassCard>
    </AuthPageShell>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthPageShell>
          <PageLoader />
        </AuthPageShell>
      }
    >
      <UpdatePasswordInner />
    </Suspense>
  );
}
