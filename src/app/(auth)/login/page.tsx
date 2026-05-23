import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <>
      <Link href="/" className="mb-8 block text-center font-display text-2xl font-bold">
        Scoutd
      </Link>
      <GlassCard className="p-8">
        <h1 className="font-display text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to continue scouting</p>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/signup" className="text-[var(--accent-electric)]">
            Create account
          </Link>
        </p>
      </GlassCard>
    </>
  );
}
