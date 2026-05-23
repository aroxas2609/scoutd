import type { PlayerProfile } from "@/types/database";

export function playerContactEmail(player: PlayerProfile): string | null {
  const contact = player.contact_email?.trim();
  if (contact) return contact;
  return player.profiles?.email?.trim() || null;
}

export function playerContactPhone(player: PlayerProfile): string | null {
  return player.contact_phone?.trim() || null;
}

export function playerHasContactDetails(player: PlayerProfile): boolean {
  return !!(playerContactEmail(player) || playerContactPhone(player));
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/\s/g, "")}`;
}
