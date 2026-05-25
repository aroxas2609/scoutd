import { BrandHeader } from "@/components/brand/brand-header";
import { SetupExitGuard } from "@/components/auth/setup-exit-guard";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <SetupExitGuard>
    <div className="min-h-dvh bg-[var(--bg-deep)] px-6 py-12 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 flex justify-center">
          <BrandHeader href="/" variant="full" size="lg" align="center" />
        </div>
        {children}
      </div>
    </div>
    </SetupExitGuard>
  );
}
