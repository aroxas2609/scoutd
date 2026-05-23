export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--bg-deep)] px-6 pitch-grid">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-[var(--accent-electric)]/10 blur-[100px]" />
      </div>
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
