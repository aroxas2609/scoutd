"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <NuqsAdapter>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              classNames: {
                toast: "border border-white/[0.08] bg-[var(--bg-elevated)] text-foreground",
              },
            }}
          />
        </NuqsAdapter>
      </QueryProvider>
    </ThemeProvider>
  );
}
