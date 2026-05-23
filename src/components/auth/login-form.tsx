"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/features/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PremiumButton } from "@/components/ui/premium-button";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const result = await signIn(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <form action={handleSubmit} className="mt-6 space-y-4">
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
      <PremiumButton type="submit" className="w-full">
        Sign in
      </PremiumButton>
    </form>
  );
}
