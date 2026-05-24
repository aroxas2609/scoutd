import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { readReturnToFromLocation } from "@/lib/navigation/profile-return-path";

/**
 * Reliable back for profile screens on mobile: use returnTo when present,
 * else history.back(), else push fallback if still on the same page.
 */
export function navigateProfileBack(
  router: AppRouterInstance,
  {
    currentPath,
    fallback = "/search",
  }: {
    currentPath: string;
    fallback?: string;
  }
) {
  const returnTo = readReturnToFromLocation();
  if (returnTo && returnTo !== currentPath) {
    router.push(returnTo);
    return;
  }

  if (typeof window === "undefined") {
    router.push(fallback);
    return;
  }

  const startPath = window.location.pathname;
  router.back();

  window.setTimeout(() => {
    if (window.location.pathname === startPath) {
      router.push(fallback);
    }
  }, 400);
}
