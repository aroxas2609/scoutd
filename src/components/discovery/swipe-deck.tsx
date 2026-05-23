"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { X, Heart } from "lucide-react";
import type { PlayerProfile } from "@/types/database";
import { PlayerCard } from "./player-card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface SwipeDeckProps {
  players: PlayerProfile[];
}

export function SwipeDeck({ players }: SwipeDeckProps) {
  const [index, setIndex] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const current = players[index];
  if (!current) {
    return (
      <p className="py-20 text-center text-muted-foreground">
        No more players. Check back soon.
      </p>
    );
  }

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 120) handleSave();
    else if (info.offset.x < -120) handlePass();
    else x.set(0);
  };

  const handlePass = () => {
    setIndex((i) => i + 1);
    x.set(0);
  };

  const handleSave = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("saved_players").upsert({
        coach_id: user.id,
        player_id: current.user_id,
      });
      toast.success("Saved to shortlist");
    }
    setIndex((i) => i + 1);
    x.set(0);
  };

  return (
    <div className="relative mx-auto h-[520px] w-full max-w-sm">
      <motion.div
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
      >
        <PlayerCard player={current} onSave={handleSave} />
      </motion.div>
      <div className="absolute -bottom-4 left-0 right-0 flex justify-center gap-6">
        <button
          type="button"
          onClick={handlePass}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur"
        >
          <X className="h-6 w-6 text-red-400" />
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--accent-electric)]/50 bg-[var(--accent-electric)]/20 shadow-[0_0_24px_rgba(57,255,20,0.3)]"
        >
          <Heart className="h-6 w-6 fill-[var(--accent-electric)] text-[var(--accent-electric)]" />
        </button>
      </div>
    </div>
  );
}
