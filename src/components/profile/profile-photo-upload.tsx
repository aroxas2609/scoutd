"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface ProfilePhotoUploadProps {
  userId: string;
  currentUrl?: string | null;
  variant?: "player" | "coach";
  className?: string;
  compact?: boolean;
}

export function ProfilePhotoUpload({
  userId,
  currentUrl,
  variant = "player",
  className,
  compact = false,
}: ProfilePhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setPreview(currentUrl ?? null);
  }, [currentUrl]);

  async function handleFile(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Use JPG, PNG, WebP, or GIF");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_SIZE_MB}MB`);
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      toast.error(
        uploadError.message.includes("Bucket")
          ? "Upload failed. Create the “avatars” bucket in Supabase Storage (public)."
          : uploadError.message
      );
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    if (profileError) {
      toast.error(profileError.message);
      setUploading(false);
      return;
    }

    if (variant === "coach") {
      await supabase
        .from("coach_profiles")
        .update({ logo_url: publicUrl })
        .eq("user_id", userId);
    }

    setPreview(publicUrl);
    await queryClient.invalidateQueries({ queryKey: ["players"] });
    await queryClient.invalidateQueries({ queryKey: ["player", userId] });
    toast.success("Profile photo updated");
    setUploading(false);
    router.refresh();
  }

  const sizeClass = compact ? "h-[88px] w-[88px]" : "h-24 w-24";

  return (
    <div className={cn(compact ? "shrink-0" : "flex flex-col items-center gap-3", className)}>
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group relative overflow-hidden rounded-full border-2 border-dashed border-white/[0.12] bg-[var(--bg-elevated)] transition-colors hover:border-[var(--accent-brand)]/40",
          sizeClass
        )}
      >
        {preview ? (
          <Image src={preview} alt="Profile" fill unoptimized className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-10 w-10 text-white/25" />
          </div>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-brand)]" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      {!compact ? (
        <p className="text-center text-xs text-muted-foreground">
          Tap to {preview ? "change" : "add"} profile photo
        </p>
      ) : null}
    </div>
  );
}
