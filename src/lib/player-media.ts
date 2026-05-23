import type { PlayerProfile } from "@/types/database";

/** @deprecated Legacy single URL — migrated to highlight_urls on read */
export const HIGHLIGHT_LINK_KEY = "highlight_url";
export const HIGHLIGHT_URLS_KEY = "highlight_urls";
export const MAX_HIGHLIGHTS = 10;

export function getPlayerHighlightUrls(player: PlayerProfile): string[] {
  const links = player.social_links ?? {};
  const multi = links[HIGHLIGHT_URLS_KEY];

  if (Array.isArray(multi)) {
    return multi.map((u) => (typeof u === "string" ? u.trim() : "")).filter(Boolean);
  }

  const legacy = links[HIGHLIGHT_LINK_KEY];
  if (typeof legacy === "string" && legacy.trim()) {
    return [legacy.trim()];
  }

  return [];
}

export function buildSocialLinksWithHighlights(
  socialLinks: PlayerProfile["social_links"],
  highlightUrls: string[]
): PlayerProfile["social_links"] {
  const next = { ...socialLinks };
  delete next[HIGHLIGHT_LINK_KEY];

  const unique = [...new Set(highlightUrls.map((u) => u.trim()).filter(Boolean))].slice(
    0,
    MAX_HIGHLIGHTS
  );

  if (unique.length) {
    next[HIGHLIGHT_URLS_KEY] = unique;
  } else {
    delete next[HIGHLIGHT_URLS_KEY];
  }

  return next;
}

export function getYoutubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url) || url.includes("/storage/v1/object/public/");
}
