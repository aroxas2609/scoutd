import { Suspense } from "react";
import Link from "next/link";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { SignupFlow } from "@/components/auth/signup-flow";

export default function SignupPage() {
  return (
    <AuthPageShell
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[var(--accent-brand)]">
            Sign in
          </Link>
        </>
      }
    >
      <GlassCard className="w-full p-8">
        <h1 className="font-display text-2xl font-bold">Join Scoutd</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Email and password only — you&apos;ll add your profile details next.
        </p>
        <Suspense fallback={<p className="mt-6 text-sm text-muted-foreground">Loading…</p>}>
          <SignupFlow />
        </Suspense>
      </GlassCard>
    </AuthPageShell>
  );
}
