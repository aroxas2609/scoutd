import { SetupExitGuard } from "@/components/auth/setup-exit-guard";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <SetupExitGuard>
    <div className="relative flex h-dvh max-h-dvh flex-col overflow-hidden bg-[var(--bg-deep)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[min(28rem,55vh)] w-[min(32rem,100vw)] -translate-x-1/2 rounded-full bg-[var(--accent-brand)]/12 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,rgba(94,234,212,0.1),transparent_55%)]" />
      </div>
      <div className="relative mx-auto flex h-full w-full max-w-lg flex-col px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
        {children}
      </div>
    </div>
    </SetupExitGuard>
  );
}
