import { cn } from "@/lib/utils";
import type { LogoConceptTheme } from "@/components/brand/logo-concepts/types";

type BackgroundSwatchProps = {
  label: string;
  background: string;
  theme: LogoConceptTheme;
  children: React.ReactNode;
  border?: boolean;
};

export function BackgroundSwatch({
  label,
  background,
  theme,
  children,
  border = false,
}: BackgroundSwatchProps) {
  const labelColor = theme === "dark" ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";

  return (
    <div
      className={cn(
        "flex min-h-[120px] flex-col justify-between rounded-xl p-5",
        border && "ring-1 ring-white/10"
      )}
      style={{ background }}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: labelColor }}>
        {label}
      </p>
      <div className="flex items-center justify-center py-4">{children}</div>
    </div>
  );
}
