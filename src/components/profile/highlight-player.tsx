"use client";

import { Link2 } from "lucide-react";
import { getYoutubeEmbedUrl, isDirectVideoUrl } from "@/lib/player-media";

export function HighlightPlayer({ url, title }: { url: string; title?: string }) {
  const youtubeEmbed = getYoutubeEmbedUrl(url);
  const isVideo = isDirectVideoUrl(url);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black">
      {youtubeEmbed ? (
        <div className="aspect-video w-full">
          <iframe
            src={youtubeEmbed}
            title={title ?? "Player highlight"}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : isVideo ? (
        <video src={url} controls playsInline className="aspect-video w-full bg-black" />
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-4 text-sm text-[var(--accent-brand)] underline"
        >
          <Link2 className="h-4 w-4" />
          Open highlight link
        </a>
      )}
    </div>
  );
}
