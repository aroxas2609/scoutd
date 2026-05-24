import { cn } from "@/lib/utils";
import { logoConceptColors } from "@/components/brand/logo-concepts/tokens";
import type { ConceptMarkProps } from "@/components/brand/logo-concepts/types";

export function VelocityMark({ size = 32, className, theme = "dark" }: ConceptMarkProps) {
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
        d="M20.5 7.5C12.5 7.5 9 11.5 9 15.25C9 17.75 10.75 19.75 14.25 20.25C10.5 20.75 8.5 23.25 8.5 26.25C8.5 30.25 12.75 33.25 20.75 31.75"
        stroke={fg}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 27.5L21.5 30.5"
        stroke={accent}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
