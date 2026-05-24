import { cn } from "@/lib/utils";
import { brandLogoColors } from "@/components/brand/colors";
import type { ConceptWordmarkProps } from "@/components/brand/logo-concepts/types";
import { OrbitMark } from "./mark";

export function OrbitWordmark({
  size = 32,
  className,
  theme = "dark",
  showMark = true,
}: ConceptWordmarkProps) {
  const { fg, accent } = brandLogoColors(theme);
  const markSize = Math.round(size * 1.05);
  const fontSize = size * 0.72;

  return (
    <span
      className={cn("inline-flex items-center gap-2.5", className)}
      role="img"
      aria-label="Scoutd"
    >
      {showMark ? <OrbitMark size={markSize} theme={theme} /> : null}
      <span
        className="font-semibold tracking-tight"
        style={{ fontSize, lineHeight: 1, color: fg }}
      >
        Scout<span style={{ color: accent }}>d</span>
      </span>
    </span>
  );
}
