import { createClient } from "@/lib/supabase/client";
import { passwordResetRedirectUrl } from "@/lib/auth/app-url";

export function getPasswordResetRedirectUrl() {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  return passwordResetRedirectUrl(origin);
}

/** Sends recovery email; link uses token_hash (see docs/auth-password-reset.md). */
export async function requestPasswordResetClient(email: string) {
  const supabase = createClient();
  const redirectTo = getPasswordResetRedirectUrl();
  return supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
}
