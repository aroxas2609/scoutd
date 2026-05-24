import { cn } from "@/lib/utils";
import { logoConceptColors } from "@/components/brand/logo-concepts/tokens";
import type { ConceptMarkProps } from "@/components/brand/logo-concepts/types";

export function SignalMark({ size = 32, className, theme = "dark" }: ConceptMarkProps) {
  const fg = theme === "dark" ? logoConceptColors.white : logoConceptColors.black;
  const accent = logoConceptColors.green;

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
      <path
        d="M21 8C13 8 9.5 12 9.5 15.75C9.5 18 11 19.75 14 20.25C10.5 20.75 8.75 23 8.75 25.75C8.75 29.5 12.5 32.25 20 31"
        stroke={fg}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="14" cy="15.85" r="2.25" fill={accent} />
    </svg>
  );
}
