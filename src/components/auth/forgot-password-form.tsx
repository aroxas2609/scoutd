"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/features/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PremiumButton } from "@/components/ui/premium-button";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const showLocalhostHint =
    typeof window !== "undefined" && window.location.hostname === "localhost";
  const showProdResetHint =
    typeof window !== "undefined" &&
    !showLocalhostHint &&
    window.location.hostname.includes("vercel.app");

  async function handleSubmit(formData: FormData) {
    setError(null);
    setMessage(null);
    setPending(true);
    try {
      const result = await requestPasswordReset(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.success) {
        setMessage(result.message);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="mt-6 space-y-4">
      {showLocalhostHint ? (
        <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-100/90">
          Reset links open on this computer only while using localhost. On your live site,
          set <span className="font-medium">NEXT_PUBLIC_APP_URL</span> in Vercel to your
          public domain.
        </p>
      ) : null}
      {showProdResetHint ? (
        <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          If the email link fails, in Supabase go to Authentication → URL configuration and
          add your Site URL plus{" "}
          <span className="font-medium text-foreground">/auth/callback</span> under Redirect
          URLs, then redeploy Vercel after setting{" "}
          <span className="font-medium text-foreground">NEXT_PUBLIC_APP_URL</span>.
        </p>
      ) : null}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 bg-white/5"
          disabled={!!message}
        />
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--accent-brand)]">{message}</p> : null}
      <PremiumButton type="submit" className="w-full" disabled={pending || !!message}>
        {pending ? "Sending…" : "Send reset link"}
      </PremiumButton>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-[var(--accent-electric)]">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
