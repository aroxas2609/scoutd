import { cn } from "@/lib/utils";
import { logoConceptColors } from "@/components/brand/logo-concepts/tokens";
import type { ConceptWordmarkProps } from "@/components/brand/logo-concepts/types";
import { SignalMark } from "./mark";

export function SignalWordmark({
  size = 32,
  className,
  theme = "dark",
  showMark = true,
}: ConceptWordmarkProps) {
  const textColor = theme === "dark" ? logoConceptColors.white : logoConceptColors.black;
  const markSize = Math.round(size * 1.05);
  const fontSize = size * 0.72;

  return (
    <span
      className={cn("inline-flex items-center gap-2.5", className)}
      role="img"
      aria-label="Scoutd"
    >
      {showMark ? <SignalMark size={markSize} theme={theme} /> : null}
      <span
        className="font-semibold tracking-tight"
        style={{ fontSize, lineHeight: 1, color: textColor }}
      >
        Scout<span style={{ color: logoConceptColors.green }}>d</span>
      </span>
    </span>
  );
}
