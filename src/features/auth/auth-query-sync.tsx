"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { clearAuthQueries } from "./auth-query-cache";

/** Single auth listener — clears React Query when the session ends. */
export function AuthQuerySync() {
  const supabase = createClient();
  const qc = useQueryClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      // SIGNED_IN is handled by login-form seeding; clearing there caused a second cold fetch.
      if (event === "SIGNED_OUT") {
        clearAuthQueries(qc);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, qc]);

  return null;
}
