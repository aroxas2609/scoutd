import { OrbitMark } from "@/components/brand/logo-concepts/option-orbit/mark";
import { OrbitWordmark } from "@/components/brand/logo-concepts/option-orbit/wordmark";
import type { BrandLogoTheme } from "@/components/brand/colors";
import { cn } from "@/lib/utils";

const FULL_HEIGHTS = { sm: 28, md: 36, lg: 48, xl: 56 } as const;
const ICON_HEIGHTS = { sm: 28, md: 32, lg: 40 } as const;

export type LogoVariant = "full" | "icon";
export type LogoSize = keyof typeof FULL_HEIGHTS;

export type LogoProps = {
  variant?: LogoVariant;
  size?: LogoSize;
  theme?: BrandLogoTheme;
  className?: string;
};

function resolveHeight(variant: LogoVariant, size: LogoSize): number {
  if (variant === "icon") {
    if (size === "xl") return ICON_HEIGHTS.lg;
    return ICON_HEIGHTS[size as keyof typeof ICON_HEIGHTS] ?? ICON_HEIGHTS.md;
  }
  return FULL_HEIGHTS[size] ?? FULL_HEIGHTS.md;
}

/** Approved brand mark: Option C — Orbit */
export function Logo({
  variant = "full",
  size = "md",
  theme = "dark",
  className,
}: LogoProps) {
  const height = resolveHeight(variant, size);

  if (variant === "icon") {
    return <OrbitMark size={height} theme={theme} className={className} />;
  }

  return <OrbitWordmark size={height} theme={theme} className={cn(className)} />;
}
