"use client";

import { motion } from "framer-motion";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { selectRole } from "@/features/auth/role-actions";
import { User, Users } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/design/motion";

export default function RolePage() {
  return (
    <AuthPageShell align="start">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="w-full space-y-5"
      >
      <motion.div variants={fadeUp} className="text-center">
        <h1 className="font-display text-2xl font-bold">Choose your path</h1>
        <p className="mt-2 text-sm text-muted-foreground">How will you use Scoutd?</p>
      </motion.div>
      <motion.div variants={fadeUp}>
        <form action={selectRole.bind(null, "player")}>
          <button type="submit" className="w-full text-left">
            <GlassCard glow className="flex items-center gap-4 p-6 transition-transform hover:scale-[1.02]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-electric)]/20">
                <User className="h-7 w-7 text-[var(--accent-electric)]" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold">Player</h2>
                <p className="text-sm text-muted-foreground">Get discovered by coaches worldwide</p>
              </div>
            </GlassCard>
          </button>
        </form>
      </motion.div>
      <motion.div variants={fadeUp}>
        <form action={selectRole.bind(null, "coach")}>
          <button type="submit" className="w-full text-left">
            <GlassCard className="flex items-center gap-4 p-6 transition-transform hover:scale-[1.02]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-neon)]/20">
                <Users className="h-7 w-7 text-[var(--accent-neon)]" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold">Coach / Club</h2>
                <p className="text-sm text-muted-foreground">Search, recruit, and invite players to trials</p>
              </div>
            </GlassCard>
          </button>
        </form>
      </motion.div>
    </motion.div>
    </AuthPageShell>
  );
}
