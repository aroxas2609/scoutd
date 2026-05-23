import type { Association } from "@/types/database";

export function associationIdFromLeagueName(
  name: string | null | undefined,
  associations: Association[]
): string | null {
  const trimmed = name?.trim();
  if (!trimmed) return null;
  return associations.find((a) => a.name === trimmed)?.id ?? null;
}

export function associationNameFromId(
  id: string | null | undefined,
  associations: Association[]
): string | null {
  if (!id) return null;
  return associations.find((a) => a.id === id)?.name ?? null;
}
