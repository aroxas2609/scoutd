export type CoachSearchEnabledInput = {
  isBrowsing: boolean;
  hasQuery: boolean;
  hasActiveFilters: boolean;
  catalogEnabled?: boolean;
};

/** Skip the search query while only browsing curated explore sections. */
export function shouldRunCoachSearch(input: CoachSearchEnabledInput): boolean {
  if (input.catalogEnabled) return true;
  if (!input.isBrowsing) return true;
  return false;
}
