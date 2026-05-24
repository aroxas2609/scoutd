import { cn } from "@/lib/utils";
import { brandLogoColors } from "@/components/brand/colors";
import type { ConceptMarkProps } from "@/components/brand/logo-concepts/types";
import { MinimalBall } from "@/components/brand/minimal-ball";

/** S-curve orbits a minimal ball — scouting / discovery around talent */
export function OrbitMark({ size = 32, className, theme = "dark" }: ConceptMarkProps) {
  const { fg, accent } = brandLogoColors(theme);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <MinimalBall cx={19} cy={16} r={5.5} stroke={fg} accent={accent} strokeWidth={1.2} />
      <path
        d="M9 9.5C9 9.5 7.5 14 9 17.5C10.5 21 14 22.5 17.5 21.5C14 24 9.5 26.5 9 29"
        stroke={fg}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 8C12 6.5 16 7 18.5 10"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
