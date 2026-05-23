import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <>
      <Link href="/" className="mb-8 block text-center font-display text-2xl font-bold">
        Scoutd
      </Link>
      <GlassCard className="p-8">
        <h1 className="font-display text-2xl font-bold">Join Scoutd</h1>
        <p className="mt-1 text-sm text-muted-foreground">Find Your Next Player</p>
        <SignupForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--accent-electric)]">
            Sign in
          </Link>
        </p>
      </GlassCard>
    </>
  );
}
