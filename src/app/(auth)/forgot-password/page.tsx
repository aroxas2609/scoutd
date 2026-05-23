import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <>
      <Link href="/" className="mb-8 block text-center font-display text-2xl font-bold">
        Scoutd
      </Link>
      <GlassCard className="p-8">
        <h1 className="font-display text-2xl font-bold">Forgot password?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send a link to reset your password.
        </p>
        <ForgotPasswordForm />
      </GlassCard>
    </>
  );
}
