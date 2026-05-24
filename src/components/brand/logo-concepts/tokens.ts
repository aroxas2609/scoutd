/** Review-only palette — not wired into globals.css */
export const logoConceptColors = {
  black: "#050608",
  graphite: "#151D30",
  white: "#FFFFFF",
  green: "#39FF14",
  /** Live app background for fit-check swatches */
  appDeep: "#0B1020",
} as const;

export const logoConceptLabels = {
  velocity: {
    id: "velocity" as const,
    name: "Option A — Velocity",
    tagline: "Forward motion and scouting path",
  },
  signal: {
    id: "signal" as const,
    name: "Option B — Signal",
    tagline: "Connection and discovery pulse",
  },
  orbit: {
    id: "orbit" as const,
    name: "Option C — Orbit",
    tagline: "Soccer ball on a scouting path — talent in motion",
  },
  strike: {
    id: "strike" as const,
    name: "Option D — Strike",
    tagline: "S mark with integrated ball — football discovery",
  },
} as const;

/** Grouping for review page sections */
export const logoConceptGroups = {
  abstract: ["velocity", "signal"] as const,
  soccer: ["orbit", "strike"] as const,
};
