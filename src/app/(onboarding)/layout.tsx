import { LogoLink } from "@/components/brand/logo-link";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[var(--bg-deep)] px-6 py-12 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 flex justify-center">
          <LogoLink href="/" variant="full" size="lg" />
        </div>
        {children}
      </div>
    </div>
  );
}
