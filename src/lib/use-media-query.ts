"use client";

import { useEffect, useState } from "react";

/** Matches Tailwind `lg` breakpoint (1024px). */
export function useIsLgScreen(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}
