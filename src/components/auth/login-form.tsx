"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { clearAuthQueries } from "@/features/auth/auth-query-cache";
import { getPostLoginRedirect } from "@/lib/auth/redirect-path";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PremiumButton } from "@/components/ui/premium-button";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const qc = useQueryClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const form = e.currentTarget;
    const email = (new FormData(form).get("email") as string)?.trim();
    const password = new FormData(form).get("password") as string;

    clearAuthQueries(qc);
    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setPending(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Sign in failed. Try again.");
      setPending(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, onboarding_complete")
      .eq("id", user.id)
      .single();

    clearAuthQueries(qc);
    router.push(getPostLoginRedirect(profile));
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required className="mt-1 bg-white/5" />
      </div>
      <div>
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-[var(--accent-electric)] hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 bg-white/5"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <PremiumButton type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </PremiumButton>
    </form>
  );
}
