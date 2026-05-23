"use client";

import { useState } from "react";
import { signUp } from "@/features/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PremiumButton } from "@/components/ui/premium-button";

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const result = await signUp(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <form action={handleSubmit} className="mt-6 space-y-4">
      <div>
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" required className="mt-1 bg-white/5" />
      </div>
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
      <PremiumButton type="submit" className="w-full">
        Create account
      </PremiumButton>
    </form>
  );
}
