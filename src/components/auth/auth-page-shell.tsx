import { BrandHeader } from "@/components/brand/brand-header";
import { cn } from "@/lib/utils";

type AuthPageShellProps = {
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  /** Use start for tall flows (e.g. role selection). */
  align?: "center" | "start";
};

export function AuthPageShell({
  children,
  footer,
  className,
  align = "center",
}: AuthPageShellProps) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <header className="flex shrink-0 justify-center pb-4">
        <BrandHeader href="/" variant="full" size="lg" align="center" />
      </header>
      <main
        className={cn(
          "flex min-h-0 flex-1 flex-col py-6",
          align === "start" ? "justify-start overflow-y-auto" : "justify-center"
        )}
      >
        {children}
      </main>
      {footer ? (
        <footer className="shrink-0 pb-0.5 text-center text-sm text-muted-foreground">
          {footer}
        </footer>
      ) : null}
    </div>
  );
}
