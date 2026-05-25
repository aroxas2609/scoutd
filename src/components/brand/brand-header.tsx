import { LogoLink, type LogoLinkProps } from "@/components/brand/logo-link";
import { cn } from "@/lib/utils";

type BrandHeaderProps = LogoLinkProps & {
  /** Center the logo in its container (auth / onboarding). */
  align?: "start" | "center";
};

export function BrandHeader({
  href = "/",
  align = "start",
  className,
  ...logoProps
}: BrandHeaderProps) {
  return (
    <LogoLink
      href={href}
      className={cn(align === "center" && "mx-auto", className)}
      {...logoProps}
    />
  );
}
