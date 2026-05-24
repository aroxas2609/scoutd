"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { clearAuthQueries } from "@/features/auth/auth-query-cache";
import { ProfileSettingsCard, ProfileSettingsRow } from "@/components/profile/profile-settings";

export function SignOutButton({ embedded }: { embedded?: boolean }) {
  const router = useRouter();
  const qc = useQueryClient();

  async function handleSignOut() {
    clearAuthQueries(qc);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (embedded) {
    return (
      <ProfileSettingsRow
        icon={LogOut}
        label="Log out"
        chevron="none"
        destructive
        onClick={() => {
          void handleSignOut();
        }}
      />
    );
  }

  return (
    <ProfileSettingsCard>
      <ProfileSettingsRow
        icon={LogOut}
        label="Log out"
        chevron="none"
        destructive
        onClick={() => {
          void handleSignOut();
        }}
      />
    </ProfileSettingsCard>
  );
}
