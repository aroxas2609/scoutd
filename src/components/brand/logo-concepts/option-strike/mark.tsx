import { cn } from "@/lib/utils";
import { logoConceptColors } from "@/components/brand/logo-concepts/tokens";
import type { ConceptMarkProps } from "@/components/brand/logo-concepts/types";
import { MinimalBall } from "@/components/brand/logo-concepts/shared/minimal-ball";

/** Stylised S with ball nested in the upper curve — football + scout mark */
export function StrikeMark({ size = 32, className, theme = "dark" }: ConceptMarkProps) {
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
      <MinimalBall cx={20.5} cy={11.5} r={5} stroke={fg} accent={accent} strokeWidth={1.1} />
      <path
        d="M10 10.5C10 10.5 11 7.5 16 7.5C20 7.5 22.5 9.5 22.5 12"
        stroke={fg}
        strokeWidth="2.35"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M9.5 15.5C9.5 18.5 11.5 20.5 15 20.75C11 21.25 9 23.5 9 26.5C9 30 13 32.5 21 31"
        stroke={fg}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 24.5L17.5 27"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
