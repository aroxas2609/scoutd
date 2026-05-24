"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { EmailOtpType } from "@supabase/supabase-js";

function resolveCallbackTarget(searchParams: URLSearchParams) {
  const next = searchParams.get("next");
  if (next?.startsWith("/")) return next;

  const type = searchParams.get("type");
  if (type === "recovery") return "/update-password";

  return "/role";
}

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    const target = resolveCallbackTarget(searchParams);

    async function finish() {
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          router.replace("/login?error=auth");
          return;
        }
      } else if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as EmailOtpType,
        });
        if (error) {
          router.replace("/login?error=auth");
          return;
        }
      } else {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            router.replace("/login?error=auth");
            return;
          }
        } else {
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();
          if (error || !session) {
            router.replace("/login?error=auth");
            return;
          }
        }
      }

      // Full navigation so cookies are visible to the next page (avoids login redirect loop).
      window.location.assign(target);
    }

    void finish();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
      Finishing sign-in…
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          Finishing sign-in…
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
