"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { clearAuthQueries } from "./auth-query-cache";

/** Single auth listener — clears React Query when Supabase session changes. */
export function AuthQuerySync() {
  const supabase = createClient();
  const qc = useQueryClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        clearAuthQueries(qc);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, qc]);

  return null;
}
