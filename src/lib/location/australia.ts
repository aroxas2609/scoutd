const STATE_ABBREV: Record<string, string> = {
  "new south wales": "NSW",
  nsw: "NSW",
  victoria: "VIC",
  vic: "VIC",
  queensland: "QLD",
  qld: "QLD",
  "south australia": "SA",
  sa: "SA",
  "western australia": "WA",
  wa: "WA",
  tasmania: "TAS",
  tas: "TAS",
  "northern territory": "NT",
  nt: "NT",
  "australian capital territory": "ACT",
  act: "ACT",
};

export type AustraliaLocationOption = {
  id: string;
  suburb: string;
  state: string;
  postcode: string;
  label: string;
};

export function abbreviateAustralianState(state?: string | null): string {
  if (!state?.trim()) return "";
  const key = state.trim().toLowerCase();
  if (STATE_ABBREV[key]) return STATE_ABBREV[key];
  if (state.length <= 3) return state.toUpperCase();
  return state;
}

export function formatAustraliaLocation(
  suburb: string,
  state: string,
  postcode: string
): string {
  const abbr = abbreviateAustralianState(state);
  return `${suburb}, ${abbr} ${postcode}`.trim();
}

export function formatAustraliaLocationLabel(
  suburb: string,
  state: string,
  postcode: string
): string {
  return formatAustraliaLocation(suburb, state, postcode);
}

/** Parse a stored `location` string back into suburb/state/postcode parts. */
export function parseStoredAustraliaLocation(
  location: string | null | undefined,
  postcode: string | null | undefined
): { suburb: string; state: string; postcode: string } {
  const storedPostcode = postcode?.trim() ?? "";
  if (!location?.trim()) {
    return { suburb: "", state: "", postcode: storedPostcode };
  }

  const withPostcode = location.match(/^(.+?),\s*([A-Za-z]{2,4})\s+(\d{4})$/);
  if (withPostcode) {
    return {
      suburb: withPostcode[1].trim(),
      state: withPostcode[2].trim(),
      postcode: withPostcode[3],
    };
  }

  const withoutPostcode = location.match(/^(.+?),\s*([A-Za-z]{2,4})$/);
  if (withoutPostcode) {
    return {
      suburb: withoutPostcode[1].trim(),
      state: withoutPostcode[2].trim(),
      postcode: storedPostcode,
    };
  }

  return { suburb: location.trim(), state: "", postcode: storedPostcode };
}
