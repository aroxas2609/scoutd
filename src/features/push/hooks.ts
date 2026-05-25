"use client";

import { useQuery } from "@tanstack/react-query";
import { listPushSubscriptions } from "./actions";

export function usePushSubscriptionsEnabled() {
  return useQuery({
    queryKey: ["push-subscriptions"],
    queryFn: async () => {
      const result = await listPushSubscriptions();
      if ("error" in result && typeof result.error === "string") {
        throw new Error(result.error);
      }
      return result.data?.length ?? 0;
    },
    staleTime: 60_000,
  });
}
