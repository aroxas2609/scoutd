import { cn } from "@/lib/utils";

const variantClasses = {
  app: "max-w-lg lg:max-w-7xl lg:px-6 xl:max-w-[90rem] xl:px-8",
  narrow: "max-w-lg lg:max-w-lg",
  full: "max-w-none",
} as const;

export function PageContainer({
  children,
  className,
  as: Component = "div",
  variant = "app",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "main" | "section";
  variant?: keyof typeof variantClasses;
}) {
  return (
    <Component
      className={cn("mx-auto w-full", variantClasses[variant], className)}
    >
      {children}
    </Component>
  );
}
