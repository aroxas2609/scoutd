import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import { Button as ButtonPrimitive } from "@base-ui/react/button";

type PremiumButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants>;

export function PremiumButton({
  className,
  variant = "default",
  type = "button",
  ...props
}: PremiumButtonProps) {
  const isOutline = variant === "outline";

  return (
    <Button
      variant="ghost"
      className={cn(
        "h-9 rounded-xl px-4 text-sm font-medium active:scale-[0.99]",
        isOutline
          ? "border border-white/20 bg-transparent text-foreground hover:bg-white/[0.06] hover:text-foreground"
          : "bg-[var(--accent-brand)] text-[var(--primary-foreground)] hover:bg-[var(--accent-brand-muted)]",
        className
      )}
      {...props}
      type={type}
    />
  );
}
