"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Film, Loader2, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HighlightPlayer } from "@/components/profile/highlight-player";
import { computeCompletionScore } from "@/features/players/repository";
import {
  buildSocialLinksWithHighlights,
  getPlayerHighlightUrls,
  MAX_HIGHLIGHTS,
} from "@/lib/player-media";
import type { PlayerProfile } from "@/types/database";
import { cn } from "@/lib/utils";

const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_VIDEO_MB = 40;

type Props = {
  player: PlayerProfile;
  isOwn: boolean;
  className?: string;
};

export function PlayerMediaSection({ player, isOwn, className }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [savingLink, setSavingLink] = useState(false);
  const [linkDraft, setLinkDraft] = useState("");

  const highlightUrls = getPlayerHighlightUrls(player);
  const atHighlightLimit = highlightUrls.length >= MAX_HIGHLIGHTS;

  async function refreshPlayer() {
    await qc.invalidateQueries({ queryKey: ["player", player.user_id] });
    router.refresh();
  }

  async function saveHighlights(urls: string[]) {
    const social_links = buildSocialLinksWithHighlights(player.social_links, urls);
    const has_highlights = urls.length > 0;

    const supabase = createClient();
    const { data: current } = await supabase
      .from("player_profiles")
      .select("*")
      .eq("user_id", player.user_id)
      .single();

    if (!current) {
      toast.error("Profile not found");
      return false;
    }

    const merged = { ...current, social_links, has_highlights };
    const completion_score = computeCompletionScore(merged);

    const { error } = await supabase
      .from("player_profiles")
      .update({ social_links, has_highlights, completion_score })
      .eq("user_id", player.user_id);

    if (error) {
      toast.error(error.message);
      return false;
    }

    await refreshPlayer();
    return true;
  }

  async function uploadToStorage(path: string, file: File) {
    const supabase = createClient();
    const { error } = await supabase.storage.from("avatars").upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (error) {
      toast.error(
        error.message.includes("Bucket")
          ? "Create the “avatars” bucket in Supabase Storage (public)."
          : error.message
      );
      return null;
    }
    return supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
  }

  async function handleVideoFile(file: File) {
    if (atHighlightLimit) {
      toast.error(`Maximum ${MAX_HIGHLIGHTS} highlights`);
      return;
    }
    if (!VIDEO_TYPES.includes(file.type)) {
      toast.error("Use MP4, WebM, or MOV");
      return;
    }
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      toast.error(`Video must be under ${MAX_VIDEO_MB}MB`);
      return;
    }

    setUploadingVideo(true);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "mp4";
    const url = await uploadToStorage(
      `${player.user_id}/highlight-${Date.now()}.${ext}`,
      file
    );
    if (url) {
      const ok = await saveHighlights([...highlightUrls, url]);
      if (ok) toast.success("Highlight video added");
    }
    setUploadingVideo(false);
  }

  async function addHighlightLink() {
    const trimmed = linkDraft.trim();
    if (!trimmed) {
      toast.error("Paste a link first");
      return;
    }
    if (atHighlightLimit) {
      toast.error(`Maximum ${MAX_HIGHLIGHTS} highlights`);
      return;
    }
    if (highlightUrls.includes(trimmed)) {
      toast.error("That link is already saved");
      return;
    }

    setSavingLink(true);
    const ok = await saveHighlights([...highlightUrls, trimmed]);
    if (ok) {
      setLinkDraft("");
      toast.success("Highlight added");
    }
    setSavingLink(false);
  }

  async function removeHighlightAt(index: number) {
    const next = highlightUrls.filter((_, i) => i !== index);
    const ok = await saveHighlights(next);
    if (ok) toast.success("Highlight removed");
  }

  if (!isOwn && highlightUrls.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-white/[0.1] px-4 py-10 text-center text-sm text-muted-foreground">
        No media uploaded yet.
      </p>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {(highlightUrls.length > 0 || isOwn) && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Highlights
              {highlightUrls.length > 0 ? (
                <span className="ml-1.5 text-foreground/70">({highlightUrls.length})</span>
              ) : null}
            </h3>
          </div>

          {highlightUrls.length > 0 ? (
            <ul className="space-y-4">
              {highlightUrls.map((url, index) => (
                <li key={`${url}-${index}`} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">Highlight {index + 1}</span>
                    {isOwn ? (
                      <button
                        type="button"
                        onClick={() => void removeHighlightAt(index)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </button>
                    ) : null}
                  </div>
                  <HighlightPlayer url={url} title={`Highlight ${index + 1}`} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No highlights yet.</p>
          )}

          {isOwn ? (
            <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-[var(--bg-surface)] p-4">
              <div>
                <Label htmlFor="highlight-link">Add YouTube or video link</Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    id="highlight-link"
                    value={linkDraft}
                    onChange={(e) => setLinkDraft(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="min-w-0 flex-1"
                    disabled={atHighlightLimit}
                  />
                  <Button
                    type="button"
                    className="shrink-0 gap-1"
                    disabled={savingLink || atHighlightLimit}
                    onClick={() => void addHighlightLink()}
                  >
                    {savingLink ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Add
                  </Button>
                </div>
                {atHighlightLimit ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Limit reached ({MAX_HIGHLIGHTS}). Remove one to add another.
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">
                    You can save up to {MAX_HIGHLIGHTS} highlights.
                  </p>
                )}
              </div>
              <div className="relative flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-white/[0.08]" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-white/[0.08]" />
              </div>
              <input
                ref={videoInputRef}
                type="file"
                accept={VIDEO_TYPES.join(",")}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleVideoFile(file);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full gap-2 rounded-xl border-white/15"
                disabled={uploadingVideo || atHighlightLimit}
                onClick={() => videoInputRef.current?.click()}
              >
                {uploadingVideo ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Film className="h-4 w-4" />
                )}
                Upload highlight video
              </Button>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
