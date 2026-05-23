export type AgeGroup = {
  code: string;
  label: string;
  minAge: number;
  maxAge: number;
  category: "MiniRoos" | "Junior" | "Youth" | "Senior" | "Masters";
};

export const AGE_GROUPS: AgeGroup[] = [
  { code: "U5", label: "Under 5", minAge: 4, maxAge: 5, category: "MiniRoos" },
  { code: "U6", label: "Under 6", minAge: 5, maxAge: 6, category: "MiniRoos" },
  { code: "U7", label: "Under 7", minAge: 6, maxAge: 7, category: "MiniRoos" },
  { code: "U8", label: "Under 8", minAge: 7, maxAge: 8, category: "MiniRoos" },
  { code: "U9", label: "Under 9", minAge: 8, maxAge: 9, category: "MiniRoos" },
  { code: "U10", label: "Under 10", minAge: 9, maxAge: 10, category: "MiniRoos" },
  { code: "U11", label: "Under 11", minAge: 10, maxAge: 11, category: "MiniRoos" },
  { code: "U12", label: "Under 12", minAge: 11, maxAge: 12, category: "Junior" },
  { code: "U13", label: "Under 13", minAge: 12, maxAge: 13, category: "Junior" },
  { code: "U14", label: "Under 14", minAge: 13, maxAge: 14, category: "Junior" },
  { code: "U15", label: "Under 15", minAge: 14, maxAge: 15, category: "Junior" },
  { code: "U16", label: "Under 16", minAge: 15, maxAge: 16, category: "Junior" },
  { code: "U17", label: "Under 17", minAge: 16, maxAge: 17, category: "Youth" },
  { code: "U18", label: "Under 18", minAge: 17, maxAge: 18, category: "Youth" },
  { code: "U21", label: "Under 21", minAge: 18, maxAge: 21, category: "Youth" },
  { code: "AA", label: "All Age", minAge: 18, maxAge: 99, category: "Senior" },
  { code: "O35", label: "Over 35", minAge: 35, maxAge: 99, category: "Masters" },
  { code: "O45", label: "Over 45", minAge: 45, maxAge: 99, category: "Masters" },
];

export const AGE_GROUP_CODES = AGE_GROUPS.map((g) => g.code) as [
  string,
  ...string[],
];

const CODE_ORDER = new Map(AGE_GROUPS.map((g, i) => [g.code, i]));

export const AGE_GROUP_CATEGORIES = [
  "MiniRoos",
  "Junior",
  "Youth",
  "Senior",
  "Masters",
] as const;

export function isAgeGroupCode(value: string): boolean {
  return CODE_ORDER.has(value);
}

export function getAgeGroupLabel(code: string): string {
  return AGE_GROUPS.find((g) => g.code === code)?.label ?? code;
}

export function sortAgeGroupCodes(codes: string[]): string[] {
  return [...codes].sort(
    (a, b) => (CODE_ORDER.get(a) ?? 999) - (CODE_ORDER.get(b) ?? 999)
  );
}

/** One-line summary for collapsed profile card */
export function formatAgeGroupsCollapsedSummary(codes: string[]): string {
  const sorted = sortAgeGroupCodes(codes);
  if (!sorted.length) return "";
  if (sorted.length <= 8) return sorted.join(", ");
  return `${sorted.slice(0, 7).join(", ")} +${sorted.length - 7} more`;
}

export function formatAgeGroupsTriggerLabel(codes: string[]): string | null {
  if (!codes.length) return null;
  const sorted = sortAgeGroupCodes(codes);
  const labels = sorted.map((code) => {
    const group = AGE_GROUPS.find((g) => g.code === code);
    return group ? `${group.code} ${group.label}` : code;
  });
  if (labels.length <= 2) return labels.join(" · ");
  return `${labels.slice(0, 2).join(" · ")} +${labels.length - 2} more`;
}

export function normalizeCoachAgeGroups(groups: string[]): string[] {
  const known = sortAgeGroupCodes(groups.filter(isAgeGroupCode));
  const legacy = groups.filter((g) => !isAgeGroupCode(g));
  return [...known, ...legacy];
}

export function groupSelectedAgeGroups(codes: string[]) {
  const selected = new Set(codes);
  const grouped = AGE_GROUP_CATEGORIES.map((category) => ({
    category,
    groups: AGE_GROUPS.filter((g) => g.category === category && selected.has(g.code)),
  })).filter((section) => section.groups.length > 0);

  const legacy = codes.filter((c) => !isAgeGroupCode(c));
  return { grouped, legacy };
}
