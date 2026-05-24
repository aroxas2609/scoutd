export type BrandLogoTheme = "dark" | "light";

/** Approved Option C — Orbit (matches /logo-review) */
export const BRAND_LOGO_ACCENT = "#39FF14";

export function brandLogoColors(theme: BrandLogoTheme) {
  return {
    fg: theme === "dark" ? "#ffffff" : "#050608",
    accent: BRAND_LOGO_ACCENT,
  };
}
