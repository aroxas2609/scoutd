export const FOOTBALL_POSITION_VALUES = [
  "GK",
  "CB",
  "LB",
  "RB",
  "LWB",
  "RWB",
  "CDM",
  "CM",
  "CAM",
  "LM",
  "RM",
  "LW",
  "RW",
  "CF",
  "ST",
] as const;

export type FootballPosition = (typeof FOOTBALL_POSITION_VALUES)[number];

const POSITION_LABELS: Record<FootballPosition, string> = {
  GK: "Goalkeeper (GK)",
  CB: "Centre back (CB)",
  LB: "Left back (LB)",
  RB: "Right back (RB)",
  LWB: "Left wing-back (LWB)",
  RWB: "Right wing-back (RWB)",
  CDM: "Defensive mid (CDM)",
  CM: "Central mid (CM)",
  CAM: "Attacking mid (CAM)",
  LM: "Left mid (LM)",
  RM: "Right mid (RM)",
  LW: "Left winger (LW)",
  RW: "Right winger (RW)",
  CF: "Centre forward (CF)",
  ST: "Striker (ST)",
};

export const FOOTBALL_POSITIONS = FOOTBALL_POSITION_VALUES.map((value) => ({
  value,
  label: POSITION_LABELS[value],
}));

const POSITION_SHORT: Record<FootballPosition, string> = {
  GK: "Goalkeeper",
  CB: "Centre back",
  LB: "Left back",
  RB: "Right back",
  LWB: "Left wing-back",
  RWB: "Right wing-back",
  CDM: "Defensive mid",
  CM: "Central mid",
  CAM: "Attacking mid",
  LM: "Left mid",
  RM: "Right mid",
  LW: "Left winger",
  RW: "Right winger",
  CF: "Centre forward",
  ST: "Striker",
};

export const FOOTBALL_POSITION_GROUPS: {
  label: string;
  positions: FootballPosition[];
}[] = [
  { label: "Goalkeeper", positions: ["GK"] },
  { label: "Defenders", positions: ["CB", "LB", "RB", "LWB", "RWB"] },
  { label: "Midfielders", positions: ["CDM", "CM", "CAM", "LM", "RM"] },
  { label: "Forwards", positions: ["LW", "RW", "CF", "ST"] },
];

export function getPositionShortLabel(value: FootballPosition): string {
  return POSITION_SHORT[value];
}

export function getPositionLabel(value: string): string {
  return FOOTBALL_POSITIONS.find((p) => p.value === value)?.label ?? value;
}

/** Trigger / profile display: `GK Goalkeeper` */
export function getPositionDisplayLabel(value: string): string {
  if (!isFootballPosition(value)) return value;
  return `${value} ${POSITION_SHORT[value]}`;
}

export function isFootballPosition(value: string): value is FootballPosition {
  return (FOOTBALL_POSITION_VALUES as readonly string[]).includes(value);
}