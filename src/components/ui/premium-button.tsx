import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import { Button as ButtonPrimitive } from "@base-ui/react/button";

type PremiumButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants>;

export function PremiumButton({
  className,
  variant = "default",
  ...props
}: PremiumButtonProps) {
  const isOutline = variant === "outline";

  return (
    <Button
      variant={variant}
      className={cn(
        "rounded-xl font-medium active:scale-[0.99]",
        isOutline
          ? "border-white/20 bg-transparent text-foreground hover:bg-white/[0.06] hover:text-foreground"
          : "bg-white text-zinc-900 hover:bg-white/90",
        className
      )}
      {...props}
    />
  );
}
