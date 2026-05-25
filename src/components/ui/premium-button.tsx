import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import { Button as ButtonPrimitive } from "@base-ui/react/button";

type PremiumButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
  };

export function PremiumButton({
  className,
  variant = "default",
  type = "button",
  loading = false,
  disabled,
  children,
  ...props
}: PremiumButtonProps) {
  const isOutline = variant === "outline";

  return (
    <Button
      variant="ghost"
      disabled={disabled || loading}
      className={cn(
        "h-9 rounded-xl px-4 text-sm font-medium active:scale-[0.99]",
        loading && "pointer-events-none",
        isOutline
          ? "border border-white/20 bg-transparent text-foreground hover:bg-white/[0.06] hover:text-foreground"
          : "bg-[var(--accent-brand)] text-[var(--primary-foreground)] hover:bg-[var(--accent-brand-muted)]",
        className
      )}
      {...props}
      type={type}
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          {children}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
