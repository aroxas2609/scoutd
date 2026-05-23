import Link from "next/link";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthPageShell
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="font-medium text-[var(--accent-brand)]">
            Create account
          </Link>
        </>
      }
    >
      <GlassCard className="w-full p-8">
        <h1 className="font-display text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to continue scouting</p>
        <LoginForm />
      </GlassCard>
    </AuthPageShell>
  );
}
