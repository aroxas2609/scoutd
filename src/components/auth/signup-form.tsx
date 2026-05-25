"use client";

import { useState } from "react";
import { signUp } from "@/features/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PremiumButton } from "@/components/ui/premium-button";

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    try {
      const result = await signUp(formData);
      if (result?.error) {
        setError(result.error);
        setPending(false);
      }
    } catch {
      setError("Could not create your account. Please try again.");
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="mt-6 space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required className="mt-1 bg-white/5" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="mt-1 bg-white/5"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <PremiumButton type="submit" className="w-full" loading={pending}>
        {pending ? "Creating account…" : "Create account"}
      </PremiumButton>
    </form>
  );
}
