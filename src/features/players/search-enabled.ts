export type PlayerSearchEnabledInput = {
  isBrowsing: boolean;
  hasQuery: boolean;
  hasActiveFilters: boolean;
  myDistrict: boolean;
  nearbyEnabled: boolean;
};

/** Skip the search query while the coach is only browsing curated discover sections. */
export function shouldRunPlayerSearch(input: PlayerSearchEnabledInput): boolean {
  if (!input.isBrowsing) return true;
  return false;
}
