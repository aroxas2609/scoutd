export type PlayerSearchEnabledInput = {
  isBrowsing: boolean;
  hasQuery: boolean;
  hasActiveFilters: boolean;
  myDistrict: boolean;
  nearbyEnabled: boolean;
  catalogEnabled?: boolean;
};

/** Skip the search query while only browsing curated discover sections. */
export function shouldRunPlayerSearch(input: PlayerSearchEnabledInput): boolean {
  if (input.catalogEnabled) return true;
  if (!input.isBrowsing) return true;
  return false;
}
