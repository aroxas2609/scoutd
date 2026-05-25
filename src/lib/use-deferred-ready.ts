"use client";

import { useEffect, useState } from "react";

/** Defer secondary work until after primary content has committed (idle or next frame). */
export function useDeferredReady(ready: boolean, timeoutMs = 120) {
  const [deferred, setDeferred] = useState(false);

  useEffect(() => {
    if (!ready) {
      setDeferred(false);
      return;
    }

    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(() => setDeferred(true), { timeout: timeoutMs });
      return () => cancelIdleCallback(id);
    }

    const id = window.setTimeout(() => setDeferred(true), 0);
    return () => window.clearTimeout(id);
  }, [ready, timeoutMs]);

  return deferred;
}
