"use client";

/** App is dark-only; avoid next-themes inline script (React 19 console warning). */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
