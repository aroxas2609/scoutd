"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { requestPasswordResetClient } from "@/features/auth/password-reset-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PremiumButton } from "@/components/ui/premium-button";

export function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const fromCallback = searchParams.get("error");
    if (fromCallback) setError(fromCallback);
  }, [searchParams]);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setMessage(null);
    setPending(true);
    try {
      const email = (formData.get("email") as string)?.trim();
      if (!email) {
        setError("Enter your email address");
        return;
      }
      const { error } = await requestPasswordResetClient(email);
      if (error) {
        setError(error.message);
        return;
      }
      setMessage("If an account exists for that email, we sent a password reset link.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="mt-6 space-y-4">
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
    </form>
  );
}
