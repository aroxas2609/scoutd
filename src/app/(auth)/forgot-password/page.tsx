import { Suspense } from "react";
import Link from "next/link";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell
      footer={
        <Link href="/login" className="font-medium text-[var(--accent-brand)]">
          Back to sign in
        </Link>
      }
    >
      <GlassCard className="w-full p-8">
        <h1 className="font-display text-2xl font-bold">Forgot password?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send a link to reset your password. You can open
          the link in any browser—even if you use Scoutd from your home screen.
        </p>
        <Suspense fallback={null}>
          <ForgotPasswordForm />
        </Suspense>
      </GlassCard>
    </AuthPageShell>
  );
}
