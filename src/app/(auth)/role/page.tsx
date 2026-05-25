"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { clearAuthQueries } from "@/features/auth/auth-query-cache";
import { selectRole } from "@/features/auth/role-actions";
import type { UserRole } from "@/types/database";
import { Loader2, User, Users } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/design/motion";

export default function RolePage() {
  const qc = useQueryClient();
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);

  async function handleSelectRole(role: UserRole) {
    if (pendingRole) return;
    setPendingRole(role);
    try {
      clearAuthQueries(qc);
      await selectRole(role);
    } catch {
      setPendingRole(null);
    }
  }
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSelectRole("player");
          }}
        >
          <button
            type="submit"
            disabled={!!pendingRole}
            className="w-full text-left disabled:opacity-70"
          >
            <GlassCard
              glow
              className="relative flex items-center gap-4 p-6 transition-transform hover:scale-[1.02]"
            >
              {pendingRole === "player" ? (
                <span className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-[var(--bg-deep)]/60">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--accent-brand)]" />
                    Setting up…
                  </span>
                </span>
              ) : null}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-electric)]/20">
                <User className="h-7 w-7 text-[var(--accent-electric)]" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold">Player</h2>
                <p className="text-sm text-muted-foreground">
                  Build your profile and get discovered by coaches in your area
                </p>
              </div>
            </GlassCard>
          </button>
        </form>
      </motion.div>
      <motion.div variants={fadeUp}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSelectRole("coach");
          }}
        >
          <button
            type="submit"
            disabled={!!pendingRole}
            className="w-full text-left disabled:opacity-70"
          >
            <GlassCard className="relative flex items-center gap-4 p-6 transition-transform hover:scale-[1.02]">
              {pendingRole === "coach" ? (
                <span className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-[var(--bg-deep)]/60">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--accent-brand)]" />
                    Setting up…
                  </span>
                </span>
              ) : null}
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
