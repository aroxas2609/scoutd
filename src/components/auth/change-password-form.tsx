"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updatePassword } from "@/features/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PremiumButton } from "@/components/ui/premium-button";
import { cn } from "@/lib/utils";

type ChangePasswordFormProps = {
  /** After reset via email link, send user into the app */
  redirectOnSuccess?: string;
  onSuccess?: () => void;
  className?: string;
  compact?: boolean;
};

export function ChangePasswordForm({
  redirectOnSuccess,
  onSuccess,
  className,
  compact,
}: ChangePasswordFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    try {
      const result = await updatePassword(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      toast.success("Password updated");
      onSuccess?.();
      if (redirectOnSuccess) {
        router.push(redirectOnSuccess);
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className={cn("space-y-3", className)}>
      {!compact ? (
        <p className="text-sm text-muted-foreground">
          Use at least 8 characters. You&apos;ll stay signed in on this device.
        </p>
      ) : null}
      <div>
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 bg-white/5"
        />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 bg-white/5"
        />
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <PremiumButton type="submit" className="w-full" disabled={pending}>
        {pending ? "Updating…" : "Update password"}
      </PremiumButton>
    </form>
  );
}
