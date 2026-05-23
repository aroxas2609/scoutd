"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircle, Search } from "lucide-react";
import { EmptyStateCinematic } from "@/components/ui/empty-state";
import { PremiumButton } from "@/components/ui/premium-button";
import { createClient } from "@/lib/supabase/client";

export function MessagesEmptyState() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setRole(data?.role ?? null);
    }
    load();
  }, []);

  const isCoach = role === "coach";

  return (
    <EmptyStateCinematic
      icon={<MessageCircle className="h-8 w-8 text-[var(--accent-electric)]" />}
      title="No messages yet"
      description={
        isCoach
          ? "Find a player, open their profile, and tap Message to start a conversation. The text box appears in the chat screen."
          : "When a coach messages you, the conversation will show up here. You can reply in the chat screen."
      }
      action={
        isCoach ? (
          <Link href="/search">
            <PremiumButton className="gap-2">
              <Search className="h-4 w-4" />
              Find players
            </PremiumButton>
          </Link>
        ) : (
          <Link href="/search">
            <PremiumButton variant="outline" className="border-white/20">
              Explore clubs
            </PremiumButton>
          </Link>
        )
      }
    />
  );
}
