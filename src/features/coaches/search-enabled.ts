export type CoachSearchEnabledInput = {
  isBrowsing: boolean;
  hasQuery: boolean;
  hasActiveFilters: boolean;
};

/** Skip the search query while the player is only browsing curated explore sections. */
export function shouldRunCoachSearch(input: CoachSearchEnabledInput): boolean {
  if (!input.isBrowsing) return true;
  return false;
}
