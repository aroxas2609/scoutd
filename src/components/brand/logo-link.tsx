import Link from "next/link";
import { Logo, type LogoProps } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

export type LogoLinkProps = LogoProps & {
  href?: string;
  className?: string;
};

export function LogoLink({ href = "/", className, ...logoProps }: LogoLinkProps) {
  return (
    <Link
      href={href}
      className={cn("inline-flex shrink-0 items-center", className)}
      aria-label="Scoutd home"
    >
      <Logo {...logoProps} />
    </Link>
  );
}
