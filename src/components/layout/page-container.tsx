import { cn } from "@/lib/utils";

export function PageContainer({
  children,
  className,
  as: Component = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "main" | "section";
}) {
  return <Component className={cn("mx-auto w-full max-w-lg", className)}>{children}</Component>;
}
