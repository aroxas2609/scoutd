"use client";

import { useEffect } from "react";

/**
 * If Supabase sends recovery tokens to the site root (hash) instead of /auth/callback,
 * forward the user to the password reset page with the same hash.
 */
export function AuthHashRedirect() {
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash.includes("access_token")) return;

    const params = new URLSearchParams(hash);
    if (params.get("type") !== "recovery") return;

    const path = window.location.pathname;
    if (path === "/update-password" || path.startsWith("/auth/callback")) return;

    window.location.replace(`/update-password#${hash}`);
  }, []);

  return null;
}
